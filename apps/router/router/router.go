package router

import (
	"fmt"
	"github.com/gocql/gocql"
	"github.com/v3xlabs/edgeserver/apps/router/services"
	"github.com/v3xlabs/edgeserver/apps/router/storage"
	"io"
	"net/http"
)

func Router(w http.ResponseWriter, r *http.Request) {
	baseUrl := r.Host
	pathUrl := r.URL.EscapedPath()

	fmt.Println(baseUrl, pathUrl)

	siteData, err := services.GetSiteData(baseUrl)

	if err == gocql.ErrNotFound {
		sendErrorPage(w, r, 404)
		return
	} else if err != nil {
		sendErrorPage(w, r, 503)
		fmt.Println(err)
		return
	}
	fmt.Println(siteData)

	deployment, err := services.GetDeploymentData(siteData.DeployId)

	if err == gocql.ErrNotFound {
		sendErrorPage(w, r, 404)
		return
	} else if err != nil {
		sendErrorPage(w, r, 502)
		fmt.Println(err)
		return
	}

	storageProvider := storage.Get()

	fileData, err := storageProvider.Get(deployment.Sid, pathUrl)
	if err != nil {
		// TODO: Better error handling
		sendErrorPage(w, r, 502)
		return
	}
	defer fileData.Close()

	w.Header().Set("Content-Type", fileData.ContentType)
	w.Header().Set("Content-Length", fileData.Length)
	w.Header().Set("X-Server", "edgeserver.io")
	_, err = io.Copy(w, fileData.Data)

	return
}
