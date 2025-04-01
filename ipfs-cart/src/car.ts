/// <reference types="bun-types" />
/// <reference path="./types/external.d.ts" />

import { filesFromPaths } from 'files-from-path'
import { CarWriter } from '@ipld/car/writer'
import { CID } from 'multiformats/cid'
import { createWriteStream } from 'fs'

const placeholderCID = CID.parse('bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi')

export async function createCarFile(inputDir: string, outputPath: string): Promise<string> {
    console.log("Creating CAR file from directory:", inputDir)
    // Get all files from the input directory
    const files = await filesFromPaths([inputDir], { hidden: false })
    
    // Create a CAR writer with placeholder CID
    const { writer, out } = await CarWriter.create([placeholderCID])
    
    // Create output stream
    const outStream = createWriteStream(outputPath)
    
    // Pipe the CAR writer output to the file
    const writerFinished = new Promise((resolve, reject) => {
        // @ts-ignore - ReadableStream type mismatch between Node and Web APIs
        out.pipe(outStream)
           .on('finish', resolve)
           .on('error', reject)
    })

    // Process each file and add to CAR
    for (const file of files) {
        const stream = await file.stream()
        const chunks: Uint8Array[] = []
        for await (const chunk of stream) {
            chunks.push(chunk)
        }
        const content = Buffer.concat(chunks)
        await writer.put({ bytes: content, cid: await file.cid() })
    }

    // Close the writer
    await writer.close()
    
    // Wait for the output stream to finish
    await writerFinished
    
    // Get the root CID
    const rootCID = (await Promise.all(files.map(f => f.cid())))[0]
    
    // Update the CAR file header with the actual root CID
    const fd = await Bun.file(outputPath).arrayBuffer()
    await CarWriter.updateRootsInFile(fd, [rootCID])
    
    return rootCID.toString()
} 