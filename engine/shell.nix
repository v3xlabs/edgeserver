{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.rustc
    pkgs.cargo
    pkgs.rustfmt
    pkgs.clippy
    pkgs.bacon
    pkgs.xz
    pkgs.bzip2
  ];

  shellHook = ''
    echo "Rust development shell loaded."
    export LD_LIBRARY_PATH="${pkgs.xz.out}/lib:${pkgs.bzip2.out}/lib:$LD_LIBRARY_PATH"
  '';
}
