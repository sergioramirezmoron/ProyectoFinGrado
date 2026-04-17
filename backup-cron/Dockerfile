FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    default-mysql-client \
    git \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY backup.sh /backup.sh
RUN chmod +x /backup.sh

CMD ["/backup.sh"]
