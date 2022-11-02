package storage

import "errors"

var (
	ErrFailed     = errors.New("failed")
	ErrStatusCode = errors.New("invalid response status code")
	ErrNotFound   = errors.New("not found")
)
