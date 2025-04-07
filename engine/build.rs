use vergen::EmitBuilder;

fn main() {
    // Configure and emit the cargo instructions
    EmitBuilder::builder()
        .all_git()
        .all_build()
        .all_cargo()
        .all_rustc()
        .emit()
        .expect("Failed to generate build information");
}
