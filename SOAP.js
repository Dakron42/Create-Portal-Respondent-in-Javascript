/*
Form.com Example
This example will create a portal respondent for a form that has been setup to accept Name and Email as prefilled criteria. The process is as follows:
1. Get the users AccountId
2. Get the
@Copyright: WorldAPP, Inc.
 */


//Admin Credentials
let fc_user = "qv_test";
let fc_pass = "qv_test";

//Soap Objects
let getAccountSOAP = '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Body><getMyAccount xmlns="http://userrole.user.v81.api.keysurvey.com"/></Body></Envelope>';
let getFormsSOAP = function(accountId){return `<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Body><getForms xmlns="http://design.form.v81.api.keysurvey.com"><accountId xmlns="">${accountId}</accountId></getForms></Body></Envelope>`;};
let getFirstQuestionSOAP = function(formId){return `<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Body><getQuestionByPosition xmlns="http://design.form.v81.api.keysurvey.com"><formId xmlns="">${formId}</formId><position xmlns="">0</position></getQuestionByPosition></Body></Envelope>`};
let getFirstQuestionAnswersSOAP = function(questionId){return `<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Body><getAnswers xmlns="http://design.form.v81.api.keysurvey.com"><questionId xmlns="">${questionId}</questionId></getAnswers></Body></Envelope>`;};
let createPortalRespondentSOAP = function(formId, contactId,questionId,Ans1Id,Ans1Txt,Ans2Id, Ans2Txt){return `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><createPortalRespondent xmlns="http://result.form.v81.api.keysurvey.com">kat mcghee state rep<formId xmlns="">${formId}</formId>kathy mcghee state rep<contactId xmlns="">${contactId}</contactId><respondentWithResults xmlns=""><respondent><versionId>0</versionId><anonym>false</anonym><deleted>false</deleted><formId>0</formId><respondentId>0</respondentId><resubmit>false</resubmit><score>0</score><submitDate>0001-01-01T00:00:00</submitDate><submitStartDate>0001-01-01T00:00:00</submitStartDate><test>false</test></respondent><results><versionId>0</versionId><answerResponses xmlns:q1="http://result.form.v81.api.keysurvey.com" xsi:type="q1:WSAnswerTextResponse"><versionId>0</versionId><answerId>${Ans1Id}</answerId><respondentId>0</respondentId><text>${Ans1Txt}</text></answerResponses><answerResponses xmlns:q2="http://result.form.v81.api.keysurvey.com" xsi:type="q2:WSAnswerTextResponse"><versionId>0</versionId><answerId>${Ans2Id}</answerId><respondentId>0</respondentId><text>${Ans2Txt}</text></answerResponses><questionId>${questionId}</questionId><respondentId>0</respondentId></results></respondentWithResults></createPortalRespondent></soap:Body></soap:Envelope>`;};
let getSingleContactSOAP = function(cmId,cmLoginField, userLogin){return `<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Body><getFilteredContacts xmlns="http://contact.v81.api.keysurvey.com"><contactManagerId xmlns="">${cmId}</contactManagerId><filter xmlns=""><filters><condition>EQUAL</condition><fieldName>${cmLoginField}</fieldName><values>${userLogin}</values></filters><logicalCondition>F1</logicalCondition></filter></getFilteredContacts></Body></Envelope>`;};

//Soap service URLs
let FormDesignSvcURL = 'https://app.form.com:443/Member/api/v81/form/design/FormDesignManagementService';
let UserManagementURL = 'https://app.form.com:443/Member/api/v81/user/userrole/UserManagementService';
let FormResultSvcURL = 'https://app.form.com:443/Member/api/v81/form/result/FormResultManagementService';
let ContactsManagementServiceURL = 'https://app.form.com:443/Member/api/v81/contact/ContactsManagementService';

//Primary API calling function
function callAPI(fc_user, fc_pass, url, data, callback){
    const basicHash = btoa(fc_user+":"+fc_pass);
    const xhr = new XMLHttpRequest();
    xhr.open("POST",url,true,fc_user,fc_pass);
    xhr.setRequestHeader("authorization", `Basic ${basicHash}`);
    xhr.setRequestHeader("content-type", `text/xml`);
    xhr.withCredentials = true;
    xhr.onreadystatechange = callback.bind(xhr);
    xhr.send(data);
}

//Callback for getting the accountId
function accountIdCallback(){
    if(this.readyState ===4 ){
        window.accountId = this.responseXML.getElementsByTagName('accountId')[0].textContent;
        console.log("AccountId Found: " + window.accountId);
        callAPI(fc_user,fc_pass,FormDesignSvcURL,getFormsSOAP(window.accountId),formListCallBack);
    }
}

//Callback for listing and selecting a form
function formListCallBack(){
    if(this.readyState ===4 ){
        let messageText = "";
        messageText+="Please choose a form:\n";

        window.formListXML = this.responseXML;
        let formObjects = formListXML.getElementsByTagName("return");

        for (let j=0; j<formObjects.length; j++){
            let xmlObj = formObjects[j];
            messageText += xmlObj.children[4].textContent +'      ' + xmlObj.children[5].textContent + '\n';

        }

        window.selectedForm = prompt(messageText);
        console.log("Selected Form: " + window.selectedForm);
        console.log("Override for testing to " + 41529878);
        window.selectedForm=41529878;
        callAPI(fc_user,fc_pass,FormDesignSvcURL,getFirstQuestionSOAP(window.selectedForm),getFormQuestionCallback);
    }


}
//Call back for storing the id of a single specified contact
function getSingleContactCallback(){
    if(this.readyState ===4 ){
        window.targetContactId = this.responseXML.getElementsByTagName('id')[0].textContent;
        callAPI(fc_user,fc_pass,FormResultSvcURL,createPortalRespondentSOAP(selectedForm,window.targetContactId,window.targetQuestionId ,window.jsonObj.name, "Rob Kinnane",window.jsonObj["email address"],"rob@test.org"));
    }
}

//call back used to handle the retrieval of the initial question and it's associated id.
function getFormQuestionCallback(){
    //Prefill should be in the first question
    if(this.readyState ===4 ){
        window.targetQuestionId = this.responseXML.getElementsByTagName('questionId')[0].textContent;
        callAPI(fc_user,fc_pass,FormDesignSvcURL,getFirstQuestionAnswersSOAP(targetQuestionId),getAnswersForPrefillCallBack);

    }
}

//Call back used to handle the retrieval of the answers for the initial question.
function getAnswersForPrefillCallBack(){
    if(this.readyState===4){
        let answerObjJSON = {};
        let prefilledAnswerDefinitions = this.responseXML.getElementsByTagName('return');
        for(let t = 0; t<prefilledAnswerDefinitions.length;t++){
            let key = prefilledAnswerDefinitions[t].getElementsByTagName('title')[0].textContent.toLowerCase();
            let val = Number(prefilledAnswerDefinitions[t].getElementsByTagName('answerId')[0].textContent.toLowerCase());


            answerObjJSON[key]= val;
        }
        window.jsonObj = answerObjJSON;
        let portalId = 456325;
        callAPI(fc_user,fc_pass,ContactsManagementServiceURL,getSingleContactSOAP(portalId,"Name", "robk"),getSingleContactCallback);
    }
}

//Initial API call. The remaining steps are executed by the callbacks.
callAPI(fc_user,fc_pass,UserManagementURL,getAccountSOAP,accountIdCallback);

