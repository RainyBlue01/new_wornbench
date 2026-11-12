window.api = {
  // apiURL: 'http://183.222.235.25:18080/api/authentication/oauth2/authorize?response_type=token&client_id=1000000000000000005',//认证地址
  // apiURL: 'http://183.222.235.25:18080/api/authentication/oauth2/authorize?response_type=token&client_id=2002908585222213633',
  // apiURL: 'http://yfb.jysm.cn:18080/api/authentication/oauth2/authorize?response_type=token&client_id=2002908585222213633',
  apiURL: 'http://localhost:8118/wornbench/',
  logoutUrl: 'http://localhost:8118/wornbench/',
  shareUrl: 'http://yfb.jysm.cn:18080/api/business/v2/share/valid',
  userURL: 'http://yfb.jysm.cn:18080',//本地跳转
  dowUrl: 'http://yfb.jysm.cn:18080/api/internal/business/file/v1/download?fileId=',//下载地址
  dataWriteUrl: 'http://yfb.jysm.cn:18080/api/business/v1/openapi/formWrite/',
  originalDataEditEnabled: true,//是否允许在原始数据中编辑，表单数据不受此配置影响
  maxSize: 20//上传文件最大容量（单位Mb）
}
