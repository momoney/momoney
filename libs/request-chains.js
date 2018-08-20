'use strict';

/**

These are request chains -- the chain of requests needed to 
extract the needed information from MEC's .NET site

There are two request chains:

1) Large Contributions (takes since as parameter)
2) Campaigns (takes MEC campaign id as parameter)

The magic happens in request.js which takes these request
chains and executes them by capturing the state returned
by the .NET site on each request and appending the state
to the next request in the chain

*/

exports.largeContributions = function({timeToCheckFrom}) {
  const currentYear = timeToCheckFrom.format("YYYY");
  const date = timeToCheckFrom.format("MM/DD/YYYY");

  return [
    {
      url: "https://mec.mo.gov/MEC/Campaign_Finance/CF12_ContrExpend.aspx",
      method: "GET",
      form_state_parameters_id: "#frmMain"
    },
    {
      url: "https://mec.mo.gov/MEC/Campaign_Finance/CF12_ContrExpend.aspx",
      method: "POST",
      form_state_parameters_id: "#frmMain",
      parameters: {
        "__EVENTTARGET": "ctl00$ctl00$ContentPlaceHolder$ContentPlaceHolder1$ddYear",
        "ctl00$ctl00$txtSearch1": "",
        "ctl00$ctl00$txtUserName": "",
        "ctl00$ctl00$txtMobileSearch": "",
        "ctl00$ctl00$ContentPlaceHolder$ContentPlaceHolder1$ddYear": currentYear,
        "ctl00$ctl00$ContentPlaceHolder$ContentPlaceHolder1$txtLName": "",
        "ctl00$ctl00$ContentPlaceHolder$ContentPlaceHolder1$txtFName": "",
      }
    },
    {
      url: "https://mec.mo.gov/MEC/Campaign_Finance/CF12_ContrExpend.aspx",
      method: "POST",
      form_state_parameters_id: "#frmMain",
      parameters: {
        "__EVENTTARGET": "ctl00$ctl00$ContentPlaceHolder$ContentPlaceHolder1$lbtnAdvanced"
      }
    },
    {
      url: "https://mec.mo.gov/MEC/Campaign_Finance/CF12_ContrExpend.aspx",
      method: "POST",
      form_state_parameters_id: "#frmMain",
      parameters: {
        "ctl00$ctl00$txtSearch1": "",
        "ctl00$ctl00$txtUserName": "",
        "ctl00$ctl00$txtMobileSearch": "",
        "ctl00$ctl00$ContentPlaceHolder$ContentPlaceHolder1$ddYear": currentYear,
        "ctl00$ctl00$ContentPlaceHolder$ContentPlaceHolder1$txtFromDate": date,
        "ctl00$ctl00$ContentPlaceHolder$ContentPlaceHolder1$txtToDate": "",
        "ctl00$ctl00$ContentPlaceHolder$ContentPlaceHolder1$txtStreet": "",
        "ctl00$ctl00$ContentPlaceHolder$ContentPlaceHolder1$txtCity": "",
        "ctl00$ctl00$ContentPlaceHolder$ContentPlaceHolder1$txtZip": "",
        "ctl00$ctl00$ContentPlaceHolder$ContentPlaceHolder1$txtEmpOcc": "",
        "ctl00$ctl00$ContentPlaceHolder$ContentPlaceHolder1$txtStartAmt": 5000,
        "ctl00$ctl00$ContentPlaceHolder$ContentPlaceHolder1$txtEndAmt": "",
        "ctl00$ctl00$ContentPlaceHolder$ContentPlaceHolder1$txtCommID": "",
        "ctl00$ctl00$ContentPlaceHolder$ContentPlaceHolder1$txtCommName": "",
        "ctl00$ctl00$ContentPlaceHolder$ContentPlaceHolder1$btnSearch": "Search"
      }
    },
    {
      url: "https://mec.mo.gov/MEC/Campaign_Finance/CF12_ContrExpendResults.aspx",
      method: "GET",
      form_state_parameters_id: "#frmMain",
    },
    {
      url: "https://mec.mo.gov/MEC/Campaign_Finance/CF12_ContrExpendResults.aspx",
      method: "POST",
      form_state_parameters_id: "#frmMain",
      parameters: {
        "__EVENTTARGET": "ctl00$ContentPlaceHolder$lbtnLarge"
      }
    },
    {
      url: "https://mec.mo.gov/MEC/Campaign_Finance/CF12_ContrExpendResults.aspx",
      method: "POST",
      parameters: {
        "ctl00$ContentPlaceHolder$btnExport": "Export Results to Excel"
      }
    }
  ];
}

exports.campaign = function({campaignId}) {
  return [
    {
      url: "https://mec.mo.gov/MEC/Campaign_Finance/CF11_SearchComm.aspx",
      method: "GET",
      form_state_parameters_id: "#frmMain"
    },
    {
      url: "https://mec.mo.gov/MEC/Campaign_Finance/CF11_SearchComm.aspx",
      method: "POST",
      form_state_parameters_id: "#frmMain",
      parameters: {
        "ctl00$ctl00$ContentPlaceHolder$ContentPlaceHolder1$txtMECID": campaignId,
        "ctl00$ctl00$ContentPlaceHolder$ContentPlaceHolder1$btnSearch": "Search"
      }
    },
    {
      url: "https://mec.mo.gov/MEC/Campaign_Finance/CF11_CommInfo.aspx",
      method: "GET"
    }
  ];
}
