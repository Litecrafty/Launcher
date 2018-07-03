'use strict'

const axios = require("axios")
const md5File = require("md5-file")
const mkdirp = require('mkdirp')
const fs = require('fs')
const crypto = require('crypto')
const assert = require('assert')

class AssetsDownload
{
  constructor(path) {
    this.path = path
    this.versionsInfos = {}
    this.assetIndexes = {}
  }

  async getVersionsList() {
    return (await axios.get('https://launchermeta.mojang.com/mc/game/version_manifest.json', { responseType: 'json' })).data
  }

  async getVersionInfos(version) {
    if(this.versionsInfos[version])
      return this.versionsInfos[version]
    let versionsList = await this.getVersionsList()
    const versionInfos = versionsList.versions.find(({id}) => id === version)
    const url = versionInfos['url']
    let path = this.path + "/versions/" + version + "/" + version + ".json"
    let exists = fs.existsSync(path);
    if(!exists) {
      await writeToFile(path, url)
    }
    return this.versionsInfos[version] = JSON.parse(await fs.readFileSync(path))
  }

  async getAssetIndex(version) {
    if(this.assetIndexes[version])
      return this.assetIndexes[version]
    let versionInfo = await this.getVersionInfos(version)
    const {id, url, size, sha1} = versionInfo["assetIndex"]
    let path = this.path + "/assets/indexes/" + id + ".json"
    let exists = fs.existsSync(path);
    var checked = true
    if (exists) checked = await checkFile(path, size, sha1)
    if(!exists || !checked) {
      await writeToFile(path, url)
    }
    return this.assetIndexes[version] = JSON.parse(await fs.readFileSync(path))
  }

  async getAllAssets(version) {
    let done = 0;
    console.log(`% Done = 0.00`)
    let assetIndex = await this.getAssetIndex(version)
    let proms = Object.keys(assetIndex['objects']).map(assetFile => this.getAsset(assetFile, version))
    proms.forEach((p) => {
      p.then(()=> {
        done++
        console.log(`% Done = ${((done * 100) / proms.length).toFixed(2)}`)
      });
    });
    return Promise.all(proms)
  }

  async getAsset(assetFile, version) {
    let assetIndex = await this.getAssetIndex(version)
    const {hash:sha1, size} = assetIndex['objects'][assetFile]
    const subPath = sha1.substring(0,2) + '/' + sha1
    const url = 'http://resources.download.minecraft.net/' + subPath
    let path = this.path + "/assets/" + assetFile
    let exists = fs.existsSync(path);
    var checked = true
    if (exists) checked = await checkFile(path, size, sha1)
    if(!exists || !checked) {
      await writeToFile(path, url)
    }
    return await checkFile(path, size, sha1)
  }
}

async function writeToFile(path, url) {
  let response = (await axios.get(url, { responseType: 'arraybuffer' })).data
  const parts = path.split("/")
  parts.pop()
  const dirPath = parts.join("/")
  await mkdirp.sync(dirPath)
  await fs.writeFileSync(path, new Buffer(response, 'binary'))
}

async function checkFile(path, size, sha1) {
  let stats = await fs.statSync(path)
  if (stats.size != size) {
    return false
  }
  let data = await fs.readFileSync(path)
  if (crypto.createHash('sha1').update(data).digest('hex') != sha1) {
    return false
  }
  return true
}

module.exports = AssetsDownload
