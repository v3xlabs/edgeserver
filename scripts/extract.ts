import { setOutput } from "@actions/core";

async () => {
    const steve = await import("../versions.json");

    if (!steve.releases) {
        console.log("No releases found");
        return;
    }

    for (let s of steve.releases) {
        setOutput(s.name.replace("@", "").replace("/", "_"), true);
    }
};
