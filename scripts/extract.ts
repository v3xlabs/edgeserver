import { setOutput } from "@actions/core";

async () => {
    const steve = await require("../versions.json");

    if (!steve.releases) {
        console.log("No releases found");
        return;
    }

    for (let s of steve.releases) {
        console.log(s.name.replace("@", "").replace("/", "_"));
        setOutput(s.name.replace("@", "").replace("/", "_"), true);
    }
};
