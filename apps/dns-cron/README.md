# dns-Cron

The purpose of the `dns-cron` microservice is to periodically add all dns domains that are pending DNS validation to the validation queue.

The service upon execution pulls all of the pending dns domains from redis and then adds them to a queue.
