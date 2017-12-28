const rp = require('request-promise');
const rq = require('request');
const fs = require('mz/fs');
const crypto = require('mz/crypto');
const assert = require('assert');
const promisify = require("es6-promisify");
const mkdirp = promisify(require('mkdirp'));
const etagDownload = promisify(require('./etag_download'));
const Queue=require('promise-queue');

const queue=new Queue(10,Infinity);

class MinecraftDownload
{
  constructor(mcPath) {
    this.mcPath=mcPath;
    this.versionsInfos={};
    this.assetIndexes={};
  }

  getVersionsList() {
    if(this.versionsList)
      return Promise.resolve(this.versionsList);
    return rp('https://launchermeta.mojang.com/mc/game/version_manifest.json').then((text) => {
      this.versionsList=JSON.parse(text);
      return this.versionsList;
    });
  }

  getVersionInfos(version) {
    if(this.versionsInfos[version])
      return Promise.resolve(this.versionsInfos[version]);
    return this.getVersionsList()
      .then(versionsList => {
        const versionInfos=versionsList.versions.find(({id}) => id===version);
        const versionUrl=versionInfos['url'];
        return etagDownload(versionUrl,this.mcPath+"/versions/"+version+"/"+version+".json")
      })
      .then(path => fs.readFile(path,"utf8"))
      .then(data => {
        const parsed=JSON.parse(data);
        this.versionsInfos[version]=parsed;
        return parsed;
      });
  }

  getAssetIndex(version) {
    if(this.assetIndexes[version])
      return Promise.resolve(this.assetIndexes[version]);
    return this.getVersionInfos(version)
      .then(versionInfo => {
        const {url,size,sha1}=versionInfo["assetIndex"];
        return downloadFile(url,this.mcPath+"/assets/minecraft/version/"+version+".json",size,sha1)
      })
      .then(path => fs.readFile(path,"utf8"))
      .then(data => {
        const parsed=JSON.parse(data);
        this.assetIndexes[version]=parsed;
        return parsed;
      });
  }

  getAllAssets(version) {
    return this.getAssetIndex(version).then(assetIndex => {
      return Promise.all(Object.keys(assetIndex['objects'])
        .map(assetFile => this.getAsset(assetFile,version)))});
  }

  getAsset(assetFile,version) {
    return this.getAssetIndex(version).then(assetIndex => {
      const {hash:sha1,size}=assetIndex['objects'][assetFile];
      const subPath=sha1.substring(0,2)+'/'+sha1;
      const url='http://resources.download.minecraft.net/'+subPath;
      return downloadFile(url,this.mcPath+"/assets/"+assetFile,size,sha1);
    });
  }
}

const pathsPromises={};

function downloadFile(url,path,size,sha1) {
  assert.notEqual(url,undefined);
  if(pathsPromises[path])
    return pathsPromises[path];
  const p=checkFile(path,size,sha1)
    .catch(err => {
      console.debug(err);
      const parts=path.split("/");
      parts.pop();
      const dirPath=parts.join("/");
      return mkdirp(dirPath)
        .then(() => {

        return queue.add(() => new Promise((resolve,reject) => {
          rq(url)
            .pipe(fs.createWriteStream(path))
            .on('close', () => resolve(path))
            .on('error', err => reject(err))
        }))
      })
        .then(() => checkFile(path,size,sha1));
    });
  pathsPromises[path]=p;
  return p;
}

function checkFile(path,size,sha1) {
  return fs.stat(path).then(stats => assert.equal(stats.size,size,"wrong size for "+path))
    .then(() => fs.readFile(path))
    .then(data => assert.equal(crypto.createHash('sha1').update(data).digest('hex'),sha1,"wrong sha1 for "+path))
    .then(() => path);
}

module.exports=MinecraftDownload;
