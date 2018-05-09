'use strict'

var Util = require('../lib/util')

module.exports = function (RED) {
  function EpoRemoteCommandNode (nodeConfig) {
    RED.nodes.createNode(this, nodeConfig)

    this._command = nodeConfig.command

    /**
     * Handle to the DXL client node used to make requests to the DXL fabric.
     * @type {Client}
     * @private
     */
    this._client = RED.nodes.getNode(nodeConfig.client)

    var node = this

    this.status({
      fill: 'red',
      shape: 'ring',
      text: 'node-red:common.status.disconnected'
    })

    if (node._client) {
      node._client.registerUserNode(this)
      this.on('input', function (msg) {
        msg.command = msg.command || node._command
        Util.runEpoCommand(node, msg, this._client.dxlClient,
          nodeConfig.returnType, nodeConfig.outputFormat)
      })
      this.on('close', function (done) {
        node._client.unregisterUserNode(node, done)
      })
      if (this._client.connected) {
        this.status({
          fill: 'green',
          shape: 'dot',
          text: 'node-red:common.status.connected'
        })
      }
    } else {
      this.error('Missing client configuration')
    }
  }

  RED.nodes.registerType('dxl-epo-remote-command', EpoRemoteCommandNode)
}