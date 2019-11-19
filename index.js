function createLib (execlib) {
  'use strict';

  var lib = execlib.lib;

  function MessengerBase (prophashignored) {
    if (!this.sendingsystemcode) {
      throw new Error(this.constructor.name+' must have a sendingsystemcode (String) in its prototype');
    }
  }
  MessengerBase.prototype.destroy = function () {
  };
  MessengerBase.prototype.send = function (params){
    var sendObj = {};
    if (!params){
      console.log('Params not provided');
      return q.reject(new lib.Error('MAILING_NO_PARAMS', 'Params not provided'));
    }
    if (!params.from){
      console.log('From (sender) not provided');
      return q.reject(new lib.Error('MAILING_INVALID_PARAMS_SENDER', 'From (sender) not provided'));
    }
    if (!params.to){
      console.log('To (receiver) not provided');
      return q.reject(new lib.Error('MAILING_INVALID_PARAMS_RECEIVER', 'To (receiver) not provided'));
    }
    if (!params.subject){
      console.log('Email Subject not provided');
      return q.reject(new lib.Error('MAILING_INVALID_PARAMS_SUBJECT', 'Email Subject not provided'));
    }
    if (!params.text && !params.html){
      console.log('Text or html must be provided');
      return q.reject(new lib.Error('MAILING_INVALID_PARAMS_CONTENTS', 'Text or html must be provided'));
    }
    return this.commitSingleMessage(params).then(
      this._onCommitSingleMessage.bind(this)
    );
  };
  MessengerBase.prototype.commitSingleMessage = function (params) {
    throw new lib.Error('NOT_IMPLEMENTED', this.constructor.name+' does not implement commitSingleMessage');
  };
  MessengerBase.prototype._onCommitSingleMessage = function (result) {
    //console.log('_onCommitSingleMessage', result);
    var success = this.successOutcomeFromCommitResponse(result),
      msgid = this.messageIdFromCommitResponse(result);
    if (success !== true && success !== false) {
      throw new Error('successOutcomeFromCommitResponse must return true or false');
    }
    if (!lib.isString(msgid)) {
      throw new Error('messageIdFromCommitResponse must return a String');
    }
    return {
      success: success,
      sendingsystemid: msgid
    };
  };
  MessengerBase.prototype.successOutcomeFromCommitResponse = function (sendingsystemresponse) {
    return true;
  }
  MessengerBase.prototype.messageIdFromCommitResponse = function (sendingsystemresponse) {
    throw new lib.Error('NOT_IMPLEMENTED', this.constructor.name+' does not implement messageIdFromCommitResponse');
  };

  MessengerBase.prototype.paramsFromDeliveryNotification = function (sendingsystemdeliverynotification) {
    throw new lib.Error('NOT_IMPLEMENTED', 'paramsFromDeliveryNotification has to return an Object with the following properties: "sendingsystemid", "sendingsystemnotified"');
  };
  MessengerBase.prototype.paramsFromBounceNotification = function (sendingsystemdeliverynotification) {
    throw new lib.Error('NOT_IMPLEMENTED', 'paramsFromBounceNotification has to return an Object with the following properties: "sendingsystemid", "sendingsystemnotified", "retryin", "toblacklist"');
  };
  MessengerBase.prototype.paramsFromComplaintNotification = function (sendingsystemdeliverynotification) {
    throw new lib.Error('NOT_IMPLEMENTED', 'paramsFromComplaintNotification has to return an Object with the following properties: "sendingsystemid", "sendingsystemnotified", "toblacklist"');
  };

  MessengerBase.methodsToAddToNotifier = ['paramsFromDeliveryNotification', 'paramsFromBounceNotification', 'sendingsystemcode'];
  MessengerBase.addMethodsToNotifier = function (klass, mychild) {
    mychild = mychild || MessengerBase;
    lib.inheritMethods(klass, mychild
      ,'paramsFromDeliveryNotification'
      ,'paramsFromBounceNotification'
      ,'paramsFromComplaintNotification'
      ,'sendingsystemcode'
    );
  };

  return {
    MessengerBase: MessengerBase
  };
}
module.exports = createLib;
