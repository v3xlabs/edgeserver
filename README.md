<a href="https://edgeserver.io" target="_blank">
  <p align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./assets/edgeserver_light.png#" />
      <img alt="edgeserver.io bridging web2 to web3" src="./assets/edgeserver_dark.png#" width="400px" />
    </picture>
  </p>
</a>

---

## Table of Contents


# IPFS-Signal

## Goals

Bridge web2 to web3

- Push code to IPFS
  - Keep track of last few version

- Serve content over HTTP
  - Find owner based on domain
  - Find location on IPFS node
  - Send `x-ipfs-path`: record to user
  - Serve content

- Update DNS records to DNSLink ([https://dnslink.io/](https://dnslink.io/))

###
sigctl login
sigctl logout

sigctl deploy
sigctl init/new

sigctl domain luc.computer ls

            Version Updated
Current ->  169     5 min ago
            168     10 min ago
            167     3 hours ago
            166     2 weeks ago

sigctl domain luc.computer rollback 166
s d luc.computer rb 166