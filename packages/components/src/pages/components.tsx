import {
    Button,
    Checkbox,
    CodeBlock,
    Container,
    Hyperlink,
    TextField,
} from 'components';
import { FC, ReactNode } from 'react';

const ItemsContainer: FC<{ children?: ReactNode }> = (properties) => {
    return (
        <div className="flex flex-col gap-5 w-full max-w-[250px]">
            {properties.children}
        </div>
    );
};

export const Components: FC = () => {
    return (
        <Container>
            <div className="px-5 py-8 flex flex-col gap-10">
                <Checkbox
                    onChange={() => {
                        if (document.body.classList.contains('dark')) {
                            document.body.classList.remove('dark');
                        } else {
                            document.body.classList.add('dark');
                        }
                    }}
                >
                    Dark mode
                </Checkbox>
                <h1 className="text-5xl">Welcome to @edgelabs/ui</h1>
                <div>
                    <h1 className="text-3xl">Link component</h1>
                    <Hyperlink href="https://og.ax">Hello world</Hyperlink>
                </div>

                <div className="flex flex-col gap-5">
                    <h1 className="text-3xl">Button component</h1>

                    <ItemsContainer>
                        <Button
                            onPress={() => {
                                alert('Pressed button!');
                            }}
                        >
                            Select Permissions
                        </Button>
                        <Button
                            isDisabled
                            onPress={() => {
                                alert('Can you trigger this?');
                            }}
                        >
                            *disabled*
                        </Button>
                        <Button variant="add">Add</Button>
                        <Button variant="add" loading>
                            Add
                        </Button>
                        <Button
                            variant="delete"
                            onPress={() => {
                                console.log('hello world');
                            }}
                        >
                            DESTROY!
                        </Button>
                        <Button href="https://og.ax">
                            This is actually a link
                        </Button>
                    </ItemsContainer>
                </div>

                <div className="flex flex-col gap-5">
                    <h1 className="text-3xl">CodeBlock component</h1>

                    <CodeBlock>edge generate github-action 000</CodeBlock>
                    <CodeBlock>
                        This is a very long code block that should wrap with an
                        scrollbar horizontally. At least on mobile, but it
                        depends on your screen width
                    </CodeBlock>
                </div>

                <div className="flex flex-col gap-5">
                    <h1 className="text-3xl">TextField component</h1>

                    <ItemsContainer>
                        <TextField
                            label="Enter value"
                            placeholder="ex. og.ax"
                        />
                        <TextField
                            aria-label="Hello world"
                            placeholder="Enter value"
                            errorMessage="Incorrect value"
                        />
                        <TextField
                            aria-label="Hello world"
                            placeholder="Enter value"
                            success
                        />
                    </ItemsContainer>
                </div>

                <div className="flex flex-col gap-5">
                    <h1 className="text-3xl">Checkbox component</h1>

                    <ItemsContainer>
                        <Checkbox>Hello world</Checkbox>
                        <Checkbox isDisabled>Disabled!</Checkbox>
                        <Checkbox
                            onChange={() => {
                                alert('Value change');
                            }}
                        >
                            Click this
                        </Checkbox>
                        <Checkbox isDisabled isSelected>
                            Disabled but selected
                        </Checkbox>
                    </ItemsContainer>
                </div>
            </div>
        </Container>
    );
};
