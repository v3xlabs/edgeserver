package services

import "path/filepath"

func TrailingSlashRedirect(config *RoutingConfig, pathUrl string) string {
	fileExt := filepath.Ext(pathUrl)

	if fileExt != "" {
		return ""
	}

	if config.TrailingSlash == "always" {
		if pathUrl[len(pathUrl)-1:] != "/" {
			return pathUrl + "/"
		}
	}

	if config.TrailingSlash == "never" {
		if pathUrl[len(pathUrl)-1:] == "/" {
			return pathUrl[:len(pathUrl)-1]
		}
	}

	return ""
}