####################################################################################################
## Base image
####################################################################################################
FROM rust:latest AS builder

RUN update-ca-certificates

RUN apt update && apt upgrade -y

RUN apt install -y protobuf-compiler libprotobuf-dev

WORKDIR /router

COPY ./services/router/Cargo.toml .
COPY ./services/router/Cargo.lock .

RUN mkdir ./src && echo 'fn main() { println!("Dummy!"); }' > ./src/main.rs

RUN cargo build

RUN rm -rf ./src

COPY ./services/router/src ./src

RUN cargo build --release

####################################################################################################
## Final image
####################################################################################################
FROM gcr.io/distroless/cc

WORKDIR /router

# Copy our build
COPY --from=builder /router/target/release/edgerouter /router/edgerouter

CMD ["/router/edgerouter"]