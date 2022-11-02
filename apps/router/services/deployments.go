package services

import (
	"github.com/v3xlabs/edgeserver/apps/router/db"
	"github.com/v3xlabs/edgeserver/apps/router/models"
)

func GetDeploymentData(deployId int64) (models.DeploymentStruct, error) {
	session := db.Get()
	data := models.DeploymentStruct{
		DeployId: deployId,
	}

	q := session.Query(models.Deployments.Get()).BindStruct(data)
	err := q.GetRelease(&data)

	return data, err
}
