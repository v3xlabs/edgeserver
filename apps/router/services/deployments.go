package services

import (
	"fmt"
	"github.com/scylladb/gocqlx/v2/qb"
	"github.com/v3xlabs/edgeserver/apps/router/db"
	"github.com/v3xlabs/edgeserver/apps/router/models"
	"log"
)

//func GetDeploymentData(deployId int64) (models.DeploymentStruct, error) {
//	session := db.Get()
//	data := models.DeploymentStruct{}
//
//	q := session.Query("SELECT * FROM deployments WHERE deploy_id=?", []string{"deploy_id"}).BindMap(qb.M{"deploy_id": deployId})
//	err := q.GetRelease(&data)
//
//	return data, err
//}

func GetDeploymentData(deployId int64) (*models.DeploymentStruct, error) {
	return UseCache(
		fmt.Sprintf("deployment_%d", deployId),
		[]ResolverSetter[models.DeploymentStruct]{
			UseLocalCache[models.DeploymentStruct](),
			UseRedisCache[models.DeploymentStruct](),
			ResolverSetter[models.DeploymentStruct]{
				Resolver: func(key string) (*models.DeploymentStruct, error) {
					session := db.Get()
					data := models.DeploymentStruct{}

					q := session.Query("SELECT * FROM deployments WHERE deploy_id=?", []string{"deploy_id"}).BindMap(qb.M{"deploy_id": deployId})
					err := q.GetRelease(&data)
					log.Printf("GetDeploymentDataDB: %v", data)

					return &data, err
				},
			},
		})

}
