sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/core/message/Message",
	"sap/m/MessageBox"
], function (Controller,History,Filter,FilterOperator,Sorter,Message,MessageBox) {
	"use strict";

	return Controller.extend("saaq.zcste022.controller.BaseController", {

		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getOwnerModel: function (sName) {
			return this.getOwnerComponent().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Returns the control instace based on provided id in the calling view
		 * @param   {string}              sId Id of Control
		 * @returns {sap.ui.core.Control} Instance of control in calling view
		 * @public
		 */
		getById: function (sId) {
			return this.getView().byId(sId);
		},

		/**
		 * Set busy indicator on view
		 * @public
		 * @param {boolean} bEnable busy true/false
		 * @returns {void}
		 */
		setBusy: function (bEnable) {
			this.getView().setBusy(bEnable);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Get text from resource bundle
		 * @public
		 * @param {string} oParm - key property of i18n for which we have to retreive value from resource bundle.
		 * @param {[]}  pArr - optional parameters array which we need to pass along with key to retrive constants from i18n
		 */
		getTextFromI18n: function (oParm, pArr) {
			var oResourceBundle = this.getResourceBundle();
			return pArr ? oResourceBundle.getText(oParm, pArr) :
				oResourceBundle.getText(oParm);
		},

		/**
		 * Convenience method for getting the filters based on model in every controller of the application.
		 * @public
		 * @param {string|string[]} anyFilterName - name of odata filter
		 * @param {string|string[]} anyPropertyName - name of property of json model filter
		 * @param {string|string[]} anyFilterOperatorType - filter type default is EQ
		 * @param {string|string[]} anyFilterValue - Any filter value hardcoded or variable
		 * @param {string} sModelName - Specific model name to read value of property 
		 * @param {string}  bAnd - AND OR filter in filter (default value is And )
		 * @returns {sap.ui.model.Filter} - the filter instance default with and operator(if multiple)
		 */
		getFilter: function (anyFilterName, anyPropertyName, anyFilterOperatorType, anyFilterValue, sModelName, bAnd) {
			var sModel = sModelName || "mainModel",
				oMainModel = this.getModel(sModel),
				sValue, sPropertyName, sFilterOperator,
				oFilter = {},
				aFilters = [];

			if (typeof anyFilterName === "string") {
				sPropertyName = anyPropertyName || anyFilterName;
				sFilterOperator = anyFilterOperatorType || FilterOperator.EQ;
				sValue = anyFilterValue || oMainModel.getProperty("/" + sPropertyName);
				if (sValue === "SPACE") {
					sValue = "";
				}
				oFilter = new Filter(anyFilterName, sFilterOperator, sValue);

			} else if (Array.isArray(anyFilterName) && anyFilterName.length) {
				anyFilterName.forEach(function (filterName, index) {
					sPropertyName = Array.isArray(anyPropertyName) ?
						anyPropertyName[index] || filterName : filterName;
					sFilterOperator = Array.isArray(anyFilterOperatorType) ?
						anyFilterOperatorType[index] || FilterOperator.EQ : FilterOperator.EQ;
					sValue = Array.isArray(anyFilterValue) ?
						anyFilterValue[index] || oMainModel.getProperty("/" + sPropertyName) : oMainModel.getProperty("/" + sPropertyName);
					if (sValue === "SPACE") {
						sValue = "";
					}
					aFilters.push(new Filter(filterName, sFilterOperator, sValue));
				});
				if(bAnd === undefined || bAnd === null){
					bAnd = true;
				}
				oFilter = new Filter({
					filters: aFilters,
					and: bAnd
				});
			}
			return oFilter;
		},
		
		getSorter : function(sSortPath, bDescending){
			return new Sorter(sSortPath, bDescending);
		},
		
		createDialog: function (oController, sDialogFragmentName) {
			var oView = oController.getView(),
				oDialog = oController._mViewSettingsDialogs[sDialogFragmentName];
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), sDialogFragmentName, oController);
				// connect dialog to view (models, lifecycle)
				oDialog.addStyleClass(oController.getOwnerComponent().getContentDensityClass());
				oView.addDependent(oDialog);
				oController._mViewSettingsDialogs[sDialogFragmentName] = oDialog;
			}
			return oDialog;
		},
		
		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 * @returns {void}
		 */
		onNavBack: function () {
			var sMode = this.getModel("mainModel").getProperty("/mode");
			var that = this; 
			if (sMode === "edit" || sMode === "new" ) { 
				MessageBox.warning(that.getTextFromI18n("warningDataLoss"), {
					styleClass: that.getOwnerComponent().getContentDensityClass(),
					actions: [that.getTextFromI18n("warningDataLossLeave"), MessageBox.Action.CLOSE],
					onClose: function (sAction) {
						if (sAction === that.getTextFromI18n("warningDataLossLeave")) {
							//oStartupModel.setChangeMode(false);
							that._navBack();
						}
					}
				});
			} else {
				this._navBack();
			}
		},
		
		/**
		 * Logic for navigating back.
		 * @private
		 * @returns {void}
		 */
		_navBack: function () {
			if (this.getOwnerComponent().getModel().hasPendingChanges()) {
				this.getOwnerComponent().getModel().resetChanges();
			}
			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell ? sap.ushell.Container.getService("CrossApplicationNavigation") :
									 undefined;

			if (sPreviousHash !== undefined || !oCrossAppNavigator) {
				history.go(-1);
			} else if (oCrossAppNavigator) {
				//no history -> navigate to fiori home
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: "#Shell-home"
					}
				});
			}
		},
		
		/**
		 * Convenience method to open message popover from any controller of the application.
		 * @public
		 * @param {Object} oEvent - event object received in handler
		 * @returns {void}
		 */
		onMessagePopoverPress: function (oEvent) {
			this._getMessagePopover().openBy(oEvent.getSource());
		},

		//################ Private APIs ###################

		/**
		 * Convenience method to get message popover from any controller of the application.
		 * @private
		 * @returns {sap.m.MessagePopover} Instance of message popover
		 */
		_getMessagePopover: function () {
			// create popover lazily (singleton)
			if (!this._oMessagePopover) {
				this._oMessagePopover = sap.ui.xmlfragment(this.getView().getId(), "saaq.zcste022.view.MessagePopover", this);
				this._oMessagePopover._oMessageView.setGroupItems(true);
				this.getView().addDependent(this._oMessagePopover);
			}
			return this._oMessagePopover;
		},

		/**
		 * Error handler for read call
		 * @param {object} oError  error object for the AJAX call
		 * @private
		 */
		onODataReadFail: function (oError) {
			var oResourceBundle = this.getResourceBundle();
			//oMsgDetail = null;
			if ((oError.statusCode === "400" || oError.statusCode === "404") && oError.responseText) {
				//oMsgDetail = JSON.parse(oError.responseText);
				MessageBox.error(oError.statusCode + "-" + oError.message, {
					details: oError.responseText,
					styleClass: this.getOwnerComponent().getContentDensityClass(),
					actions: [MessageBox.Action.CLOSE]
				});
			} else {
				try {
					MessageBox.error(oResourceBundle.getText("ERR_REST_FAIL_MSG", [oError.statusCode, oError.responseText]));
				} catch (e) {
					MessageBox.error(oResourceBundle.getText("ERR_ODATA_FAIL_MSG"));
				}

			}
		},

		/* =========================================================== */
		/* messages event handlers                                     */
		/* =========================================================== */

		/**
		 * method initialize the message processor by registering the message processor and
		 * by setting the Messages model to the view.
		 * @public
		 * @param {object} oMessageProcessor Message Processor Model
		 */
		initializeMessageManager: function (oMessageProcessor) {
			var oMessageManager = this._getMessageManager();
			oMessageManager.registerObject(this.getView(), true);
			// register the message processor
			oMessageManager.registerMessageProcessor(oMessageProcessor);
			this.removeAllMessages();
		},

		/**
		 * method to get the Message manager.
		 * @returns {object} Message Manager
		 * @private
		 */
		_getMessageManager: function () {
			return sap.ui.getCore().getMessageManager();
		},

		/**
		 * method to get the instance message processor model
		 * @private
		 * @returns {object} - Instance of Message Processor Model
		 */
		_getMessageModel: function () {
			return this._getMessageManager().getMessageModel();
		},

		/**
		 * helper method to add the message to Message Processor Model
		 * and updates the ErrorCount in the model
		 * @param {string} - sTarget - Binding Path of the Control
		 * @param {string} - sMessage - MessageText
		 * @param {string} - sLongText - Long Description Text
		 * @param {string} - sMessageType - MessageType
		 * @param {string} [[Description]]
		 * @public
		 */
		addMessage: function (sTarget, sMessage, sLongText, sMessageType, oMessageProcessor,sAdditionalText) {
			if (!oMessageProcessor) {
				oMessageProcessor = this.getModel();
			}
			this._addMessage(sTarget, sMessage, sLongText, sMessageType, oMessageProcessor,null,sAdditionalText);
		},

		/**
		 * method to add the message to Message Processor Model
		 * based on Target and removes the old messages for for given Target.
		 * @private
		 * @param {string}  sTarget           Binding path of the control
		 * @param {string}  sMessage          message text
		 * @param {string}  sLongText         Long description text
		 * @param {string}  sMessageType      type of message
		 * @param {object}  oMessageProcessor Message Processor Model
		 * @param {boolean} bRemovePrev       Previous message for the same target will not be removed if false.
		 */
		_addMessage: function (sTarget, sMessage, sLongText, sMessageType, oMessageProcessor, bRemovePrev, sAdditionalText) {

			var oMessageManager = this._getMessageManager(),
				oMessage = {
					target: sTarget,
					message: sMessage,
					description: sLongText,
					type: sMessageType,
					additionalText : sAdditionalText,
					processor: oMessageProcessor
				};

			if (bRemovePrev !== false) {
				// remove existing messages for this control
				this.removeMessage(sTarget, oMessageProcessor);
			}

			// Add New Message using message manager
			oMessageManager.addMessages(new Message(oMessage));
		},

		/**
		 * method to add the more then one messages to Message Processor Model
		 * @public
		 * @param {[]} aMessages - Messages in standard format for message processor
		 */
		addMessages: function (aMessages) {
			var oMessageManager = this._getMessageManager();
			oMessageManager.addMessages(aMessages);
		},

		/**
		 * method to remove the message from message processor model based on target path
		 * @public
		 * @param {string} sTarget           Binding path of the control
		 * @param {object} oMessageProcessor Message Processor Model
		 */
		removeMessage: function (sTarget, oMessageProcessor) {
			if (!oMessageProcessor) {
				oMessageProcessor = this.getModel();
			}
			this._removeMessage(sTarget, oMessageProcessor);
		},

		/**
		 * method to remove the message from message processor model based on target path
		 * @private
		 * @param {string} sTarget           Binding path of the control
		 * @param {object} oMessageProcessor Message Processor Model
		 */
		_removeMessage: function (sTarget, oMessageProcessor) {
			var oMessageManager = this._getMessageManager();
			oMessageManager.removeMessages(oMessageProcessor.getMessagesByPath(sTarget));
		},

		/**
		 * method to remove all messages from message processor model
		 * @public
		 * @param {any}    anyTargetPattern  target pattern/list of target pattern
		 * @param {object} oMessageProcessor message processor if specific will be used
		 */
		removeAllMessages: function (anyTargetPattern, oMessageProcessor) {
			var oMessageManager = this._getMessageManager(),
				aMessages = [],
				iMsgCounter,
				iPatternCounter,
				sCurrentTargetPattern;

			if (!oMessageProcessor) {
				oMessageProcessor = this.getModel();
			}
			if (!anyTargetPattern) {
				oMessageManager.removeAllMessages();
			} else if (typeof anyTargetPattern === "string") {
				aMessages = jQuery.extend(true, [], this._getMessageModel().getData());
				//Remove messages with provided target pattern
				for (iMsgCounter = aMessages.length - 1; iMsgCounter >= 0; iMsgCounter--) {
					if (aMessages[iMsgCounter].target.indexOf(anyTargetPattern) !== -1) {
						aMessages.splice(iMsgCounter, 1);
					}
				}
				oMessageManager.removeAllMessages();
				oMessageManager.addMessages(aMessages);
			} else if (jQuery.isArray(anyTargetPattern) && anyTargetPattern.length) {
				aMessages = jQuery.extend(true, [], this._getMessageModel().getData());
				//For all the patterns provided as an argument
				for (iPatternCounter = anyTargetPattern.length - 1; iPatternCounter >= 0; iPatternCounter--) {
					//Remove messages with current target pattern
					sCurrentTargetPattern = anyTargetPattern[iPatternCounter];
					for (iMsgCounter = aMessages.length - 1; iMsgCounter >= 0; iMsgCounter--) {
						if (aMessages[iMsgCounter].target.indexOf(sCurrentTargetPattern) !== -1) {
							aMessages.splice(iMsgCounter, 1);
						}
					}
				}
				oMessageManager.removeAllMessages();
				oMessageManager.addMessages(aMessages);
			}
		}
        
	});
}, true);