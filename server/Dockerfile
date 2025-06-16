FROM golang:1.24.0-alpine

RUN apk update && apk upgrade && apk add --no-cache git

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o main ./cmd

EXPOSE 8080

CMD ["./main"]
