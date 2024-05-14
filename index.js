const FONT_COLOR = "#FFFFFF";
const BG_COLOR = "#1B0AE1";

function onOpen() {
    // Create a custom menu in the spreadsheet
    let ui = SpreadsheetApp.getUi();
    ui.createMenu("Better Contact")
        .addItem("Find emails / mobile number", "openSidebar")
        .addToUi();
}

function openSidebar() {
    // Create and display the sidebar
    let html = HtmlService.createHtmlOutputFromFile("index")
        .setTitle("Find emails / mobile number")
        .setWidth(350);
    SpreadsheetApp.getUi().showSidebar(html);
}

/***
 * GET sheet metadata on startup
 * ***/
function getSheetMataData() {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    let metadata = {
        'columns': getColumns(),
        'row_count': sheet.getLastRow()
    }

    console.log(metadata)
    return metadata
}

function getColumns() {
    // createRequiredColumns()
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    let headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    headerRow = headerRow.map(item => item.toLowerCase());
    let colInfo = {}
    colInfo['first_name'] = getColumnInfo(headerRow, 'first_name')
    colInfo['last_name'] = getColumnInfo(headerRow, 'last_name')
    colInfo['company'] = getColumnInfo(headerRow, 'company')
    colInfo['domain'] = getColumnInfo(headerRow, 'domain')
    colInfo['linkedin'] = getColumnInfo(headerRow, 'linkedin')
    colInfo['email'] = getColumnInfo(headerRow, 'email')
    colInfo['status'] = getColumnInfo(headerRow, 'status')
    colInfo['provider'] = getColumnInfo(headerRow, 'workspace provider')
    colInfo['phone'] = getColumnInfo(headerRow, 'direct phone number')
    console.log(colInfo)
    console.log(headerRow)
    return colInfo;
}

function createRequiredColumns() {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    let headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    headerRow = headerRow.map(item => item.toLowerCase());
    var lastColumn = sheet.getLastColumn();
    var lastRow = sheet.getLastRow();
    var newColumn = lastColumn + 1;

    let columns = ['email', 'status', 'workspace provider', 'direct phone number'];
    let newColumns = []
    columns.forEach((col) => {
        let colInfo = getColumnInfo(headerRow, col)
        if (colInfo == null) {
            newColumns.push(col)
            Logger.log(`${col} added in the sheet`)
        }
        else {
            console.log(`${col} - Column alread exist`)
        }
    })

    if (newColumns.length > 0) {
        let rangeForNewColumns = sheet.getRange(1, sheet.getLastColumn() + 1, 1, newColumns.length)
        rangeForNewColumns.setValues([newColumns])
    }

}

function getRequiredColumns() {
    let colInfo = {}
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    let headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    headerRow = headerRow.map(item => item.toLowerCase());
    colInfo['email'] = getColumnInfo(headerRow, 'email')
    colInfo['status'] = getColumnInfo(headerRow, 'status')
    colInfo['provider'] = getColumnInfo(headerRow, 'workspace provider')
    colInfo['phone'] = getColumnInfo(headerRow, 'direct phone number')
    return colInfo
}

function createEmptyColumns() {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastColumn = sheet.getLastColumn();
    console.log(lastColumn)
    sheet.insertColumnAfter(lastColumn)
    sheet.insertColumnAfter(lastColumn + 1)
    sheet.insertColumnAfter(lastColumn + 2)
    sheet.insertColumnAfter(lastColumn + 3)
    console.log('3 empty Columns has been added')
    return {
        'email': { 'name': getColumnNameFromIndex(lastColumn), 'index': lastColumn },
        'status': { 'name': getColumnNameFromIndex(lastColumn + 1), 'index': lastColumn + 1 },
        'provider': { 'name': getColumnNameFromIndex(lastColumn + 2), 'index': lastColumn + 2 },
        'phone': { 'name': getColumnNameFromIndex(lastColumn + 3), 'index': lastColumn + 3 },
    }
}

function getColumnInfo(headerRow, col) {
    let choices = [];
    if (col == 'first_name')
        choices = ['firstname', 'first', 'first name']
    else if (col == 'last_name')
        choices = ['lastname', 'last_name', 'last name']
    else if (col == 'company')
        choices = ['company', 'company_name', 'company name']
    else if (col == 'domain')
        choices = ['domain', 'company_domain', 'company domain', 'website', 'company website', 'company_website']
    else if (col == 'linkedin')
        choices = ['linkedinurl', 'linkedin_url', 'linkedin url', 'linkedin profile', 'linkedin_profile', 'linkedinprofile', 'profile', 'profileurl', 'profile_url', 'profile url', 'linkedin']
    else if (col == 'email')
        choices = ['email']
    else if (col == 'status')
        choices = ['status']
    else if (col == 'workspace provider')
        choices = ['workspace provider']
    else if (col == "direct phone number")
        choices = ['direct phone number']

    let colInfo = null
    choices.map(choice => {
        if (headerRow.indexOf(choice) > -1) {
            colInfo = {
                'index': headerRow.indexOf(choice),
                'name': getColumnNameFromIndex(headerRow.indexOf(choice))
            }
        }
    })
    return colInfo

}

function getColumnNameFromIndex(index) {
    return String.fromCharCode(64 + (index + 1))
}

function postDataToAPI(API_KEY, payload) {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    let txtFirstNameCol = getColumnIndex(payload.txtFirstName);
    let txtLastNameCol = getColumnIndex(payload.txtLastName);
    let txtCompanyNameCol = getColumnIndex(payload.txtCompanyName);
    let txtDomainCol = getColumnIndex(payload.txtCompanyDomain);
    let txtLinkedInCol = getColumnIndex(payload.txtLinkedIn);

    // Get the last row with data in any of the specified columns
    let lastRow = sheet.getLastRow();
    let startingRow = 2;
    let skipRows = parseInt(payload.txtSkipRows)

    if (skipRows >= lastRow) {
        return {
            "status": "error",
            "message": "You cannot skip more rows then exist"
        }
    }

    if (payload.cbSheetHasHeaders == "NO") {
        startingRow = 1
    }

    if (skipRows > 0) {
        startingRow = skipRows + 1
    }

    if (payload.cbSheetHasHeaders == "YES" && skipRows < 1) {
        lastRow = lastRow - 1
    }


    // getRange(startRow, startColumn, numRows, numColumns)
    // Get the data in the specified columns for all rows
    let dataRange = sheet.getRange(startingRow, 1, lastRow, sheet.getLastColumn());
    let data = dataRange.getValues();

    // Convert data to a list of dictionaries
    let dataListToPost = [];
    data.map(function (row, index) {
        if (
            row[txtFirstNameCol] != '' ||
            row[txtLastNameCol] != '' ||
            row[txtCompanyNameCol] != ''
        ) {

            let dataObject = {
                "first_name": row[txtFirstNameCol],
                "last_name": row[txtLastNameCol],
                "company": row[txtCompanyNameCol],
                "company_domain": row[txtDomainCol],
                "linkedin_url": row[txtLinkedInCol],
                "custom_fields": {
                    "row_id": index
                }
            };
            dataListToPost.push(dataObject);
        }
    });
    let dataPayload = {
        data: dataListToPost,
        "verify_catch_all": payload.cbVerifyCatchAll == "YES" ? true : false,
        "enrich_phone_number": payload.cbEnrichPhoneNumber == "YES" ? true : false
    }

    response = makePostCall(API_KEY, dataPayload);

    let returnData = {
        "payload": payload,
        "api_key": API_KEY,
        "id": response.id
    }

    response["data"] = returnData
    return response

}

function makePostCall(API_KEY, postData) {
    const URL = "https://app.bettercontact.rocks/api/v2/async?api_key=" + API_KEY;
    // Options for the fetch request
    var options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(postData),
    };

    try {
        response = UrlFetchApp.fetch(URL, options);
        if (response.getResponseCode() === 200 || response.getResponseCode() === 201) {
            responseData = JSON.parse(response.getContentText());
            responseData.status = "success";
            responseData.message = "Your sheet has been submitted for enrichment.";
            return responseData
        } else {
            return {
                "status": "error",
                "message": response.getContentText()
            };
        }
    }
    catch (exception) {
        return {
            "status": "error",
            "message": exception.message.replace("(use muteHttpExceptions option to examine full response)", "")
        }
    }
}

function getColumnIndex(field) {
    return field.toUpperCase().charCodeAt(0) - 64 - 1;
}

function runGetRequest() {

    var data = {
        "api_key": "2705f1db8959a2431e54",
        "payload": {
            "txtRequestId": "",
            "txtSkipRows": "98",
            "cbSkipRows": "on",
            "cbAgree": "on",
            "cbSheetHasHeaders": "NO",
            "txtCompanyName": "B",
            "txtLastName": "J",
            "txtFirstName": "C",
            "txtLinkedIn": "A",
            "txtCompanyDomain": "I"
        },
        "id": "8fb395f4e71fb97fc15a"
    }
    let response = checkStatusAndGetData(data)
    console.log(response)
}


/**
 * @DEPRICATED
 */
function createHeaders(payload) {
    let headers = [];
    let ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getActiveSheet();


    if (payload.cbSheetHasHeaders == "NO") {
        let txtFirstNameCol = getColumnIndex(payload.txtFirstName);
        let txtLastNameCol = getColumnIndex(payload.txtLastName);
        let txtCompanyNameCol = getColumnIndex(payload.txtCompanyName);
        let txtDomainCol = getColumnIndex(payload.txtCompanyDomain);
        let txtLinkedInCol = getColumnIndex(payload.txtLinkedIn);

        if (!isNaN(txtFirstNameCol))
            headers.splice(txtFirstNameCol, 0, "First Name")

        if (!isNaN(txtLastNameCol))
            headers.splice(txtLastNameCol, 0, "Last Name")

        if (!isNaN(txtCompanyNameCol))
            headers.splice(txtCompanyNameCol, 0, "Company Name")

        if (!isNaN(txtDomainCol))
            headers.splice(txtDomainCol, 0, "Company Domain")

        if (!isNaN(txtLinkedInCol))
            headers.splice(txtLinkedInCol, 0, "Linkedin URL")
    }


    headers.push("Email")
    headers.push("Email Provider")
    headers.push("Delivery Status")

    let rangeToFill = null
    if (payload.cbSheetHasHeaders == "NO") {
        sheet.insertRowBefore(1)
        Logger.log("A new row has been inserted on top")
        rangeToFill = sheet.getRange(1, 1, 1, headers.length)
    }
    else {
        // getRange(startRow, startColumn, numRows, numColumns)
        rangeToFill = sheet.getRange(1, sheet.getLastColumn() + 1, 1, 3)
    }



    rangeToFill.setValues([headers]);
    Logger.log("Header values are filled")
}

function checkStatusAndGetData(params) {
    console.log('checking process status')
    console.log(params)
    let response = getDataFromBetterConnect(params)
    if (response.status == "terminated") {
        console.log('Process has  been terminated')
        writeEmailsToSheet(response.data, params)
        delete response["data"]
    }
    return response
}


function writeEmailsToSheet(data, params) {
    let payload = params.payload;
    let sortedData = data.sort((a, b) => a.custom_fields[0].value - b.custom_fields[0].value);
    let skipRows = parseInt(payload.txtSkipRows)
    let startingRow = 1
    if (payload.cbSheetHasHeaders == 'YES') {
        startingRow = 2
    }

    let ss = SpreadsheetApp.getActiveSpreadsheet();
    let currentSheet = ss.getActiveSheet();

    if (skipRows > 0) {
        startingRow = skipRows + 1
    }

    if (payload.cbSheetHasHeaders == 'YES') {
        createRequiredColumns()
        let enrichedColumns = getRequiredColumns()
        sortedData.map((row) => {
            let emailCol = `${enrichedColumns.email.name}${startingRow}`
            let statusCol = `${enrichedColumns.status.name}${startingRow}`
            let providerCol = `${enrichedColumns.provider.name}${startingRow}`
            currentSheet.getRange(emailCol).setValue(row.contact_email_address)
            currentSheet.getRange(statusCol).setValue(row.contact_email_address_status)
            currentSheet.getRange(providerCol).setValue(row.contact_email_address_provider)

            if (payload.cbEnrichPhoneNumber == 'YES') {
                let phoneCol = `${enrichedColumns.phone.name}${startingRow}`
                currentSheet.getRange(phoneCol).setValue(row.contact_phone_number)
            }

            startingRow++
        });

    }
    else {
        let newColumnIndexes = createEmptyColumns()
        sortedData.map((row) => {
            let emailCol = `${newColumnIndexes.email.name}${startingRow}`
            let statusCol = `${newColumnIndexes.status.name}${startingRow}`
            let providerCol = `${newColumnIndexes.provider.name}${startingRow}`
            console.log(emailCol)
            currentSheet.getRange(emailCol).setValue(row.contact_email_address)
            currentSheet.getRange(statusCol).setValue(row.contact_email_address_status)
            currentSheet.getRange(providerCol).setValue(row.contact_email_address_provider)

            if (payload.cbEnrichPhoneNumber == 'YES') {
                let phoneCol = `${enrichedColumns.phone.name}${startingRow}`
                currentSheet.getRange(phoneCol).setValue(row.contact_phone_number)
            }
            startingRow++
        });

    }
    console.log('emails written to sheet....')
}

function getDataFromBetterConnect(params) {
    try {
        const URL = `https://app.bettercontact.rocks/api/v2/async/${params.id}?api_key=${params.api_key}`;
        response = UrlFetchApp.fetch(URL);
        if (response.getResponseCode() === 200 || response.getResponseCode() === 201) {
            responseData = JSON.parse(response.getContentText());
            if (responseData.status == "not started yet") {
                responseData.status = "pending"
                responseData.message = "Enrichment task did not start yet. Please wait"
            }
            else if (responseData.status == "in progress") {
                responseData.status = "processing"
                responseData.message = "Enrichment task is in progress"
            }
            else if (responseData.status == "terminated") {
                responseData.status = "terminated"
                responseData.message = "Enrichment task is terminated. Results are available."
            }
            else {
                responseData.status = "error"
                responseData.message = "Enrichment task is in error."
            }
            return responseData
        } else {
            return {
                "status": "error",
                "message": response.getContentText()
            };
        }
    }
    catch (exception) {

        if (exception.message.includes("Unvalid request_id")) {
            return {
                "status": "pending",
                "message": "Enrichment task did not start yet. Please wait"
            }
        }
        else {

            return {
                "status": "error",
                "message": exception.message.replace("(use muteHttpExceptions option to examine full response)", "")
            }

        }
    }
}
