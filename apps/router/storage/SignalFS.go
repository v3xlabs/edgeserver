package storage

import (
	"errors"
	"net/http"
	"net/url"
	"path/filepath"
)

type SignalFS struct {
	SignalFSHost string
}

func NewSignalFS(host string) *SignalFS {
	return &SignalFS{
		SignalFSHost: host,
	}
}

func (s *SignalFS) Get(bucketName string, path string) (*FileData, error) {
	resp, err := http.Get(s.SignalFSHost + "/buckets/" + bucketName + "/get?path=" + url.QueryEscape(path))

	if err != nil {
		return &FileData{}, err
	}

	// TODO: check for not found
	if resp.StatusCode != 200 {
		return nil, ErrStatusCode
	}

	contentType := resp.Header.Get("Content-Type")
	length := resp.Header.Get("Content-Length")

	return &FileData{
		Name:        "",
		ContentType: contentType,
		Length:      length,
		Data:        resp.Body,
	}, nil
}

func (s *SignalFS) Exists(bucketName string, path string) (bool, error) {
	resp, err := http.Get(s.SignalFSHost + "/buckets/" + bucketName + "/exists?path=" + url.QueryEscape(path))

	if err != nil {
		return false, err
	}

	return resp.StatusCode == 200, nil
}

func (s *SignalFS) Traverse(bucketName string, path string) (*ResolveData, error) {
	for len(path) > 1 {
		index := filepath.Join(path, ".", "index.html")
		fileData, err := s.Get(bucketName, index)
		if err != nil {
			fileData.Close()
			if errors.Is(err, ErrStatusCode) {
				return nil, err
			}

			path = filepath.Dir(path)
			continue
		}

		return &ResolveData{
			path: path,
			file: fileData,
		}, nil
	}

	return nil, ErrNotFound
}
