fn main() {
    let x = build_info_build::build_script();
    let y = x.build();

    let git_info = y.version_control.map(|v| v.git().cloned());
    println!("Git information: {git_info:?}");
}
