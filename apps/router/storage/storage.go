package storage

import "io"

const (
	NotFound = iota
	File
	Directory
)

type FileData struct {
	io.Closer

	Name        string
	Data        io.ReadCloser
	ContentType string
	Length      string
}

func (f *FileData) Close() error {
	return f.Data.Close()
}

type ResolveData struct {
	file *FileData
	path string
}

type Storage interface {
	Get(bucketName string, path string) (*FileData, error)
	Traverse(bucketName string, path string) (*ResolveData, error)
	Exists(bucketName string, path string) (bool, error)
}

var _storage Storage

func Set(storage Storage) {
	_storage = storage
}

func Get() Storage {
	return _storage
}
