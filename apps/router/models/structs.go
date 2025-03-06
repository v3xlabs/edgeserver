package models

type DltStruct struct {
	BaseUrl  string
	AppId    int64
	DeployId int64
}

type DeploymentStruct struct {
	AppId    int64
	DeployId int64
	Cid      string
	Sid      string
	Context  string
}

type DeploymentConfigsStruct struct {
	Headers   string
	Rewrites  string
	Redirects string
	Routing   string
	DeployId  int64
}
