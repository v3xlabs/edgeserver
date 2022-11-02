package db

import (
	"fmt"
	"github.com/gocql/gocql"
	"github.com/scylladb/gocqlx/v2"
)

var _session *gocqlx.Session

func Setup() (*gocqlx.Session, error) {
	cluster := gocql.NewCluster("127.0.0.1")
	cluster.Keyspace = "signal"
	cluster.Consistency = gocql.One

	session, err := gocqlx.WrapSession(cluster.CreateSession())
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	_session = &session

	return &session, nil
}

func Get() *gocqlx.Session {
	return _session
}
