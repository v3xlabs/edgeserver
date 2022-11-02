package services

import (
	"github.com/v3xlabs/edgeserver/apps/router/db"
	"github.com/v3xlabs/edgeserver/apps/router/models"
)

func GetSiteData(baseUrl string) (models.DltStruct, error) {
	session := db.Get()
	data := models.DltStruct{
		BaseUrl: baseUrl,
	}

	q := session.Query(models.Dlt.Get()).BindStruct(data)
	err := q.GetRelease(&data)

	return data, err
}
