import { Button } from '@components/Common/Button/Button';
import { Checkbox } from '@components/Common/Checkbox/Checkbox';
import { CodeBlock } from '@components/Common/CodeBlock/CodeBlock';
import { Hyperlink } from '@components/Common/Hyperlink/Hyperlink';
import { TextField } from '@components/Common/TextField/TextField';
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
        <div className="containerd pt-8 flex flex-col gap-10">
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
                    scrollbar horizontally. At least on mobile, but it depends
                    on your screen width
                </CodeBlock>
            </div>

            <div className="flex flex-col gap-5">
                <h1 className="text-3xl">TextField component</h1>

                <ItemsContainer>
                    <TextField label="Enter value" placeholder="ex. og.ax" />
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
    );
};
