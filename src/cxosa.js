const core = require('@actions/core')
const utils = require('./utils.js')
const envs = process.env
const GITHUB_REPOSITORY = utils.getLastString(envs.GITHUB_REPOSITORY)
const GITHUB_REF = utils.getLastString(envs.GITHUB_REF)
const GITHUB_WORKSPACE = envs.GITHUB_WORKSPACE
let user
let password
let token
let project
let team
let high = -1
let medium = -1
let low = -1
let osaLocationPath
let osaArchiveToExtract
let osaFilesInclude
let osaFilesExclude
let osaPathExclude
let osaReportHtml
let osaReportPDF
let osaDepth = -1
let executePackageDependency = false
let osaJson
let checkPolicy = false

async function getOsaCmd(server, action) {
    if (utils.isValidUrl(server) && utils.isValidAction(action)) {
        let cxUsername = core.getInput('cxUsername', { required: false })
        let cxPassword = core.getInput('cxPassword', { required: false })
        let cxToken = core.getInput('cxToken', { required: false })
        let cxTeam = core.getInput('cxTeam', { required: true })
        let cxOsaHigh = core.getInput('cxOsaHigh', { required: false })
        let cxOsaMedium = core.getInput('cxOsaMedium', { required: false })
        let cxOsaLow = core.getInput('cxOsaLow', { required: false })
        let cxOsaLocationPath = core.getInput('cxOsaLocationPath', { required: false })
        let cxOsaArchiveToExtract = core.getInput('cxOsaArchiveToExtract', { required: false })
        let cxOsaFilesInclude = core.getInput('cxOsaFilesInclude', { required: false })
        let cxOsaFilesExclude = core.getInput('cxOsaFilesExclude', { required: false })
        let cxOsaPathExclude = core.getInput('cxOsaPathExclude', { required: false })
        let cxOsaReportHtml = core.getInput('cxOsaReportHtml', { required: false })
        let cxOsaReportPDF = core.getInput('cxOsaReportPDF', { required: false })
        let cxOsaDepth = core.getInput('cxOsaDepth', { required: false })
        let cxExecutePackageDependency = core.getInput('cxExecutePackageDependency', { required: false })
        let cxOsaJson = core.getInput('cxOsaJson', { required: false })
        let cxCheckPolicy = core.getInput('cxCheckPolicy', { required: false })

        if (utils.isValidString(cxToken)) {
            token = cxToken
        } else {
            if (utils.isValidString(cxUsername)) {
                core.info('cxUsername: ' + cxUsername)
                user = cxUsername.trim()
            } else {
                core.setFailed("Please provide 'cxUsername' input (string) : " + cxUsername)
                return
            }

            if (utils.isValidString(cxPassword)) {
                password = cxPassword
            } else {
                core.setFailed("Please provide 'cxPassword' input (string)")
                return
            }
        }

        if (utils.isValidTeam(cxTeam)) {
            core.info('cxTeam: ' + cxTeam)
            team = cxTeam.trim()
            project = team + "\\" + GITHUB_REPOSITORY + "-" + GITHUB_REF
        } else {
            core.setFailed("Please provide 'cxTeam' input (string): " + cxTeam)
            return
        }

        if (utils.isValidInt(cxOsaHigh)) {
            core.info('cxOsaHigh: ' + cxOsaHigh)
            high = parseInt(cxOsaHigh)
        } else {
            core.warning('OSA High Threshold valid not provided : ' + cxOsaHigh)
        }

        if (utils.isValidInt(cxOsaMedium)) {
            core.info('cxOsaMedium: ' + cxOsaMedium)
            medium = parseInt(cxOsaMedium)
        } else {
            core.warning('OSA Medium Threshold valid not provided : ' + cxOsaMedium)
        }

        if (utils.isValidInt(cxOsaLow)) {
            core.info('cxOsaLow: ' + cxOsaLow)
            low = parseInt(cxOsaLow)
        } else {
            core.warning('OSA Low Threshold valid not provided : ' + cxOsaLow)
        }

        if (utils.isValidString(cxOsaLocationPath)) {
            core.info('cxOsaLocationPath: ' + cxOsaLocationPath)
            osaLocationPath = cxOsaLocationPath.trim()
        } else {
            core.warning('"cxOsaLocationPath" not provided')
        }

        if (utils.isValidString(cxOsaArchiveToExtract)) {
            core.info('cxOsaArchiveToExtract: ' + cxOsaArchiveToExtract)
            osaArchiveToExtract = cxOsaArchiveToExtract.trim()
        } else {
            core.warning('"cxOsaArchiveToExtract" not provided')
        }

        if (utils.isValidString(cxOsaFilesInclude)) {
            core.info('cxOsaFilesInclude: ' + cxOsaFilesInclude)
            osaFilesInclude = cxOsaFilesInclude.trim()
        } else {
            core.warning('"cxOsaFilesInclude" not provided')
        }

        if (utils.isValidString(cxOsaFilesExclude)) {
            core.info('cxOsaFilesExclude: ' + cxOsaFilesExclude)
            osaFilesExclude = cxOsaFilesExclude.trim()
        } else {
            core.warning('"cxOsaFilesExclude" not provided')
        }

        if (utils.isValidString(cxOsaPathExclude)) {
            core.info('cxOsaPathExclude: ' + cxOsaPathExclude)
            osaPathExclude = cxOsaPathExclude.trim()
        } else {
            core.warning('"cxOsaPathExclude" not provided')
        }

        if (utils.isValidString(cxOsaReportHtml)) {
            core.info('cxOsaReportHtml: ' + cxOsaReportHtml)
            osaReportHtml = cxOsaReportHtml.trim()
        } else {
            core.warning('"osaReportHtml" not provided')
        }

        if (utils.isValidString(cxOsaReportPDF)) {
            core.info('cxOsaReportPDF: ' + cxOsaReportPDF)
            osaReportPDF = cxOsaReportPDF.trim()
        } else {
            core.warning('"cxOsaReportPDF" not provided')
        }

        if (utils.isValidInt(cxOsaDepth)) {
            core.info('cxOsaDepth: ' + cxOsaDepth)
            osaDepth = parseInt(cxOsaDepth)
        } else {
            core.warning('"cxOsaDepth" valid not provided : ' + cxOsaDepth)
        }

        if (utils.isBoolean(cxExecutePackageDependency)) {
            core.info('cxExecutePackageDependency: ' + cxExecutePackageDependency)
            executePackageDependency = cxExecutePackageDependency
        } else {
            core.warning('"cxExecutePackageDependency" valid flag not provided')
        }

        if (utils.isValidString(cxOsaJson)) {
            core.info('cxOsaJson: ' + cxOsaJson)
            osaJson = cxOsaJson.trim()
        } else {
            core.warning('"cxOsaJson" not provided')
        }

        if (utils.isBoolean(cxCheckPolicy)) {
            core.info('cxCheckPolicy: ' + cxCheckPolicy)
            checkPolicy = cxCheckPolicy
        } else {
            core.warning('"cxCheckPolicy" valid flag not provided')
        }

        let credentials = ""

        if (token) {
            credentials = " -CxToken " + token
        } else {
            credentials = " -CxUser " + user + " -CxPassword " + password
        }

        let command = action +
            " -CxServer " + server +
            credentials +
            " -ProjectName \"" + project + "\"" +
            " -LocationType folder" +
            " -LocationPath \"" + GITHUB_WORKSPACE + "\"" +
            " -EnableOsa"

        if (high >= 0) {
            command += " -OSAHigh " + high
        }
        if (medium >= 0) {
            command += " -OSAMedium " + medium
        }
        if (low >= 0) {
            command += " -OSALow " + low
        }
        if (osaDepth >= 0) {
            command += " -OsaScanDepth " + osaDepth
        }
        if (executePackageDependency && executePackageDependency != "false") {
            command += " -executepackagedependency"
        }
        if (checkPolicy && checkPolicy != "false") {
            command += " -CheckPolicy"
        }
        if (osaLocationPath) {
            command += " -OsaLocationPath \"" + osaLocationPath + "\""
        }
        if (osaArchiveToExtract) {
            command += " -OsaArchiveToExtract \"" + osaArchiveToExtract + "\""
        }
        if (osaFilesInclude) {
            command += " -OsaFilesInclude \"" + osaFilesInclude + "\""
        }
        if (osaFilesExclude) {
            command += " -OsaFilesExclude \"" + osaFilesExclude + "\""
        }
        if (osaPathExclude) {
            command += " -OsaPathExclude \"" + osaPathExclude + "\""
        }
        if (osaReportHtml) {
            command += " -OsaReportHtml \"" + osaReportHtml + "\""
        }
        if (osaReportPDF) {
            command += " -OsaReportPDF \"" + osaReportPDF + "\""
        }
        if (osaJson) {
            command += " -OsaJson \"" + osaJson + "\""
        }
        
        return command
    } else {
        core.setFailed("Invalid Server or action : " + server + " " + action)
        return
    }
}

module.exports = {
    getOsaCmd: getOsaCmd
}