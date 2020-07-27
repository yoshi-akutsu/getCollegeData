function onOpen() {
  SpreadsheetApp.getUi() 
      .createMenu('Add New School')
      .addItem('Search', 'openDialog')
      .addToUi();
}

function openDialog() {
  var html = HtmlService.createHtmlOutputFromFile('Index');
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .showModalDialog(html, ' ');
}

// College Data API call
const APIKEY = '&api_key=qkorLW8iMdlqQaEeof72qF2jfmhWdVPObp3Uqdov';
const base = 'https://api.data.gov/ed/collegescorecard/v1/';
const query = 'schools.json?school.name=';

// Google Sheets API call
const jsonSchoolNames = 'https://sheets.googleapis.com/v4/spreadsheets/1NyYnDdanMWPDXYzgISVuysDCIm9roE6WEkVlBh5JnEU/values/sheet?key=AIzaSyCi7iqiLy0C3lPWR-1ZgrMrf1It3ihRDIA';

function getSchoolNames(searchTerm){
  // API Call to Google Sheet with all school names
  let response = UrlFetchApp.fetch(jsonSchoolNames);
  let json = response.getContentText();
  let data = JSON.parse(json);
  let schools = data.values;
  let matches = [];
  for(let i = 0; i < schools.length; i++) {
    let lowered = schools[i][0].toLowerCase();
    let substring = searchTerm.toLowerCase();
    if(lowered.includes(substring)) {
      matches.push(schools[i][0])
    }
  }
  return matches;
}

function stringToQuery(string) {
  let array = string.split("");
  for(let i = 0; i < array.length; i++) {
    if(array[i] === " ") {
      array.splice(i, 1, "%20");
    }
  }
  return array.join("");
}

function getSchoolData(schoolName) {
  const url = base + query + stringToQuery(schoolName) + APIKEY;
  let response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
  let json = response.getContentText();
  let data = JSON.parse(json);
  return data;
}

function privatePublic(number) {
  switch (number) {
    case 1: 
      return "Public";
    case 2: 
      return "Private non-profit";
    case 3: 
      return "Private for-profit";   
  }
}


/*
  aid.pell_grant_rate : The proportion of undergraduates who received a Pell grant in the academic year, calculated from the IPEDS Student Financial Aid component. This metric is calculated by IPEDS as the quotient of the number of Pell grant recipients divided by the count of all undergraduates for either a fall enrollment cohort (for institutions that primarily follow an academic year calendar system) or a full-year enrollment cohort (for institutions that primarily follow a continuous enrollment or program-based calendar system). Proportions are expressed as decimals rounded to four decimal places, so, for example, 0.1234 equals 12.34 percent. This metric is not available prior to the 2008-09 academic year.
  school.tuition_revenue_per_fte : Net tuition revenue (tuition revenue minus discounts and allowances) divided by the number of FTE students (undergraduates and graduate students) (http://nces.ed.gov/ipeds/glossary/index.asp?id=854). Net tuition revenue is included in the IPEDS Finance component and FTE enrollment is included in the IPEDS 12-Month Enrollment component. This metric includes graduate students.
  cost.attendance.academic_year : The average annual total cost of attendance, including tuition and fees, books and supplies, and living expenses for all full-time, first-time, degree/certificate-seeking undergraduates who receive Title IV aid. It is calculated from values in the IPEDS Institutional Characteristics and Student Financial Aid components. Separate metrics are calculated for academic-year institutions and program-year institutions. For academic-year institutions, average cost of attendance represents an average of all programs and includes only full-time, first-time, degree/certificate-seeking undergraduates who first enrolled in the fall term. For non-academic-year institutions (program or continuous enrollment), average cost of attendance represents the program with the largest enrollment at the institution, and it includes full-time, first-time, degree/certificate-seeking undergraduates who first enrolled at any time during the academic year. For programs less than 1 year in length (see LProgram), this represents the cost for the full program.
  cost.title_iv.public.all : The number of full-time, first-time, degree/certificate-seeking undergraduates who received Title IV aid (http://nces.ed.gov/ipeds/glossary/index.asp?searchtype=term&keyword=title+iv+aid), included in the IPEDS Student Financial Aid component. Separate metrics are calculated for public institutions and private institutions. For public institutions, this metric is limited to full-time, first-time, degree/certificate-seeking undergraduates who pay in-state tuition and receive Title IV aid. For private institutions, it includes all full-time, first-time, degree/certificate-seeking undergraduates who receive Title IV aid. For academic-year institutions, this metric includes full-time, first-time, degree/certificate-seeking undergraduates who first enrolled in the fall term. For non-academic-year institutions (program or continuous enrollment), this metric represents the program with the largest enrollment at the institution, and it includes full-time, first-time, degree/certificate-seeking undergraduates who first enrolled at any time during the academic year. This metric is not available prior to the 2009-10 academic year.
  cost.avg_net_price.public : Shown/used on consumer website;    The average annual total cost of attendance (CostT4_A, CostT4_P), including tuition and fees, books and supplies, and living expenses, minus the average grant/scholarship aid. It is calculated for all full-time, first-time, degree/certificate-seeking undergraduates who receive Title IV aid. It is included in the IPEDS Student Financial Aid component. Separate metrics are calculated for public institutions and private institutions. For public institutions, this metric is limited to full-time, first-time, degree/certificate-seeking undergraduates who pay in-state tuition and receive Title IV aid. For private institutions, it includes all full-time, first-time, degree/certificate-seeking undergraduates who receive Title IV aid. The total cost of attendance depends on whether full-time, first-time, degree/certificate-seeking undergraduates live on campus, off campus (not with family), or off campus (with family). For academic-year institutions, net price represents an average of all programs and includes only full-time, first-time, degree/certificate-seeking undergraduates who first enrolled in the fall term. For non-academic-year institutions (program or continuous enrollment), net price represents the program with the largest enrollment at the institution and it includes full-time, first-time, degree/certificate-seeking undergraduates who first enrolled at any time during the academic year. For programs less than 1 year in length (see LProgram), this represents the net price for the full program. This metric is not available prior to the 2009-10 academic year.
  cost.avg_net_price.private : 
  admissions.sat_scores.25th_percentile.critical_reading
    sat_scores.75th_percentile.critical_reading
    sat_scores.25th_percentile.math
    sat_scores.75th_percentile.math
  aid.federal_loan_rate : The proportion of undergraduates who received a federal loan in the academic year, calculated from values from the IPEDS Student Financial Aid component. Proportions are expressed as decimals rounded to four decimal places, so, for example, 0.1234 equals 12.34 percent. This metric is not available prior to the 2009-10 academic year.
  student.FAFSA_applications : Data element describes the earnings cohort (without exclusions for military and in-school deferments in the measurement year)
  aid.ftft_pell_grant_rate : The proportion of full-time, first-time undergraduates who received a Pell grant in the academic year, calculated from the IPEDS Student Financial Aid component. This metric is calculated by IPEDS as the quotient of the number of full-time, first-time Pell grant recipients divided by the count of all full-time, first-time undergraduates for either a fall enrollment cohort (for institutions that primarily follow an academic year calendar system) or a full-year enrollment cohort (for institutions that primarily follow a continuous enrollment or program-based calendar system). Proportions are expressed as decimals rounded to four decimal places, so, for example, 0.1234 equals 12.34 percent. This metric is not available prior to the 2008-09 academic year.
  aid.ftft_federal_loan_rate : The proportion of full-time, first-time undergraduates who received a federal loan in the academic year, calculated from values from the IPEDS Student Financial Aid component. Proportions are expressed as decimals rounded to four decimal places, so, for example, 0.1234 equals 12.34 percent. This metric is not available prior to the 2009-10 academic year.
  
*/

function writeToSheet(results) {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheets()[0];
  sheet.appendRow([" "]);

  sheet.appendRow([" "]);
  sheet.appendRow([results.results[0].school.name]);
  sheet.appendRow([" "]);
  sheet.appendRow(["Address", results.results[0].school.city + ", " + results.results[0].school.state, "", "Key Stats", "", "", "Cost", "", "", "Financial Aid Deadline", "", "Endowment", ""]);
  sheet.appendRow(["Web", results.results[0].school.school_url, "", "U.S. News College Ranking", "", "", "Tuition (In State)", results.results[0].latest.cost.tuition.in_state, "", "% of undergrads applying for aid", "", "Avg financial aid package", ""]);
  sheet.appendRow(["Private/Public", privatePublic(results.results[0].school.ownership), "", "ACT Range", results.results[0].latest.admissions.act_scores["25th_percentile"].cumulative + "-" + results.results[0].latest.admissions.act_scores["75th_percentile"].cumulative, "", "Tuition (Out of State)", results.results[0].latest.cost.tuition.out_of_state, "", "% of undergrads who recieved aid", "", "Avg non-need gift aid (out of state)", ""]);
  sheet.appendRow(["Enrollment", results.results[0].latest.student.enrollment.undergrad_12_month, "", "Acceptance Rate", results.results[0].latest.admissions.admission_rate.overall, "", "R/B", "", "", "% of need met in full", "", "% of non-need gift aid (out of state)", ""]);
  sheet.appendRow(["Early Action Deadline", "", "", "Avg High School GPA", "", "", "Books (avg)", "1000", "", "", "", "Avg need based loan", ""]);
  sheet.appendRow(["Regular decision Deadline", "", "", "App Fee", "", "", "Average Debt", results.results[0].latest.aid.median_debt.completers.overall]);
  sheet.appendRow(["Accepts Common App", "", "", "Freshman Retention", results.results[0].latest.student.retention_rate.four_year.full_time, "", "Proportion who borrowed", results.results[0].latest.aid.federal_loan_rate]);  
  
  Logger.log("Wrote to Sheet successfully.")
}