export const LoadingApp = () => {
    return (
        <div className="m-8 flex flex-col gap-4">
            <div className="h-8 w-64 skeleton rounded-lg" />
            <div className="h-32 w-full skeleton rounded-lg" />
        </div>
    );
};
