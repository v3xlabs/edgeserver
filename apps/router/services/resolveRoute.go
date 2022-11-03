package services

import (
	"github.com/v3xlabs/edgeserver/apps/router/storage"
	"log"
	"path/filepath"
	"strings"
)

func ResolveRoute(storageProvider storage.Storage, bucketName string, path string, fallbackPath string) (*storage.FileData, error) {
	pathList := strings.Split(path, "/")

	log.Printf("pathList: %v", pathList)

	for i := len(pathList) - 1; i > 0; i-- {
		log.Println("loop")
		fileName := pathList[i]
		fileExt := filepath.Ext(fileName)

		path := filepath.Join(pathList[:i]...)
		if fileName == "" {
			path = filepath.Join(path, "index.html")
		} else if fileExt == "" {
			path = filepath.Join(path, fileName+".html")
		} else {
			path = filepath.Join(path, fileName)
		}
		// log fileName, fileExt, path
		log.Printf("fileName: %s, fileExt: %s, path: %s", fileName, fileExt, path)

		exists, err := storageProvider.Exists(bucketName, path)

		if err != nil {
			return &storage.FileData{}, err
		}

		if exists {
			fileData, err := storageProvider.Get(bucketName, path)
			if err != nil {
				return &storage.FileData{}, err
			}
			return fileData, nil
		}
	}

	if fallbackPath != "" {
		exists, err := storageProvider.Exists(bucketName, fallbackPath)

		if err != nil {
			return &storage.FileData{}, err
		}

		if exists {
			fileData, err := storageProvider.Get(bucketName, fallbackPath)
			if err != nil {
				return &storage.FileData{}, err
			}
			return fileData, nil
		}
	}

	//	TODO: Implement Fallback SID
	return &storage.FileData{}, storage.ErrNotFound
}
