package services

import (
	"github.com/scylladb/gocqlx/v2/qb"
	"github.com/v3xlabs/edgeserver/apps/router/db"
	"github.com/v3xlabs/edgeserver/apps/router/models"
)

func GetDeploymentData(deployId int64) (models.DeploymentStruct, error) {
	session := db.Get()
	data := models.DeploymentStruct{}

	q := session.Query("SELECT * FROM deployments WHERE deploy_id=?", []string{"deploy_id"}).BindMap(qb.M{"deploy_id": deployId})
	err := q.GetRelease(&data)

	return data, err
}
