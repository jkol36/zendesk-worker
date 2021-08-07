const Promise = require('bluebird');
const agent = require('superagent-bluebird-promise');
const zendesk = require('node-zendesk');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const fs = require('fs');
const mailgun = new Mailgun(formData);
const PDFDocument = require("pdfkit");
const html_to_pdf = require('html-pdf-node');

const moment = require('moment');
const pdf = require('html-pdf');
const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY, public_key: process.env.MAILGUN_PUBLIC_KEY});


const headers = {
    'authority': '1gp7ekfoja.execute-api.us-east-1.amazonaws.com',
    'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'dnt': '1',
    'sec-ch-ua-mobile': '?0',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36',
    'origin': 'https://s3.amazonaws.com',
    'sec-fetch-site': 'cross-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://s3.amazonaws.com/',
    'accept-language': 'en-US,en;q=0.9'
};

const getPracticeSessions = () => {
    return agent.get('https://1gp7ekfoja.execute-api.us-east-1.amazonaws.com/dev/zd')
     .set(headers)
     .then(res => res.body)
}

const getDashboardData = () => {
    return agent
          .get('https://1gp7ekfoja.execute-api.us-east-1.amazonaws.com/dev/')
          .set(headers)
          .then(res => res.body)
        
}
const instantiateClient = () => {
    return new Promise((resolve, reject) => {
        const client =  zendesk.createClient({
            username:  process.env.ZENDESK_USERNAME,
            token:     process.env.ZENDESK_API_KEY,
            remoteUri: 'https://remote.zendesk.com/api/v2'
        });
        resolve(client)
    }) 
}
const handleDashboardData = dashboardData => {
    const { data } = dashboardData
    const { tab1data } = data
    const {
        contacts_incoming_total, 
        contacts_incoming_handled, 
        avg_handle_time, 
        avg_speed_to_answer, 
        calls_abondoned
        } = tab1data[0]

        return {
            contacts_incoming_total,
            contacts_incoming_handled,
            avg_handle_time,
            avg_speed_to_answer,
            calls_abondoned
        }
}

Promise.all([getDashboardData(), getPracticeSessions()]).spread((dashboardData, practiceSessions) => {
    const { 
        contacts_incoming_handled, 
        contacts_incoming_total, 
        avg_speed_to_answer, 
        avg_handle_time, 
        calls_abondoned
        } = handleDashboardData(dashboardData)
        console.log(practiceSessions[0])
        const practiceSessionNodes = practiceSessions.map(practiceSession => {
            const {
                call_prompt,
                language,
                device,
                call_direction,
                issues,
                date
            } = practiceSession
            return (
                `
                <tr> 
                    <td> ${moment(date)} </td>
                    <td> ${call_prompt} </td>
                    <td> ${language} </td>
                    <td> ${device} </td>
                    <td> ${call_direction} </td>
                    <td> ${issues} </td>
                
                </tr>`
            )
        })
        const browserWebSigninIssues = practiceSessions.filter(ticket => ticket.issues === 'browser_web_sign-in_issues').length
        const browserJoinMeetingIssues = practiceSessions.filter(ticket => ticket.issues === 'browser_web_start/join_meeting_issues').length
        const otherInformationIssues = practiceSessions.filter(ticket => ticket.issues === 'other__information').length
        const installedSoftwareIssues = practiceSessions.filter(ticket => ticket.issues === 'installedsoftware_desktop_sign-in_issues').length
        const installedSoftwareMeetingIssues = practiceSessions.filter(ticket => ticket.issues === 'installedsoftware_desktop_start/join_meeting_issues').length
        const otherReferToHealthCoachIssues = practiceSessions.filter(ticket => 'other_refer_to_health_coach').length
        const windowsIssues = practiceSessions.filter(ticket => ticket.device === 'desktop/laptop__windows').length
        const macIssues = practiceSessions.filter(ticket => ticket.device === 'desktop/laptop__macos').length
        const androidIssues = practiceSessions.filter(ticket => ticket.device === 'moblie_device__android').length
        console.log('other informaiton issues', otherInformationIssues)
        const html = `
            <html>
                <head> 
                    <style> 
                        table {
                          font-family: arial, sans-serif;
                          border-collapse: collapse;
                          width: 100%;
                        }

                        td, th {
                        border: 1px solid #dddddd;
                        text-align: left;
                        padding: 8px;
                        }

                        tr:nth-child(even) {
                        background-color: #dddddd;
                        }
                        .header-container {
                            text-align: center;
                            width: 250px;
                            height: 100px;
                        }
                        .subtitle {
                            color: #cdadad;
                        }
                        .table {
                            border: 2px solid grey;
                            border-radius: 2px;

                        }
                        .table-cell {
                            margin-left: 20px;
                        }
                        .header-container {
                            text-align: center;
                            width: 1000px;
                        }
                        .table {
                          table-layout: fixed;
                        }

                       

                    </style>
                </head>
                <body>
                <div>
                        <h2 style="text-align:center;"> Inbound Calls KPI's <span class="subtitle"> Live </span> </h2>
                    <table class="table"> 
                            <tr>
                                <th> Total Inbound Calls </th>
                                <th> Inbound calls answered </th>
                                <th> average speed to answer </th>
                                <th> Average Handle Time </th>
                                <th> Calls Abandonded </th>
                            </tr>
                            <tr> 
                                <td> ${contacts_incoming_total} </td>
                                <td> ${contacts_incoming_handled} </td>
                                <td> ${avg_speed_to_answer} </td>
                                <td> ${avg_handle_time} </td>
                                <td> ${calls_abondoned} </td>
                            </tr>
                    </table>
                </div>
                <div>
                    <h2 style='text-align:center;'> Zendesk Dashboard <span style="color:#cdadad;">Live </span> </h2>
                    <table class="table"> 
                            <tr>
                                <th> Date</th>
                                <th> Call Prompt </th>
                                <th> Call Language </th>
                                <th> Call Device </th>
                                <th> Call Direction </th>
                                <th> Call Issues </th>
                            </tr>
                            
                            ${practiceSessionNodes}
                    </table>
                </div>
                <div>
                    <h2 style='text-align:center;'> Tag Mapping </h2>
                    <table class="table"> 
                            <tr>
                                <th> week </th>
                                <th> Information</th>
                                <th> Other Refer to Health Check </th>
                                <th> Browser Signin Issues </th>
                                <th> Start/Join Meeting Issues </th>
                                <th> Feature Utilization </th>
                                <th> Installed Software Signin Issues </th>
                                <th> Start/Join meeting issues </th>
                                <th> Installation Issue </th>
                                <th> Feature Utilization </th>
                                <th> Windows </th>
                                <th> Mac </th>
                                <th> IOS </th>
                                <th> Android </th>
                            </tr>
                            
                            <tr>
                              <td> Week 1 </td> 
                              <td> ${otherInformationIssues} </td>
                              <td> ${otherReferToHealthCoachIssues} </td>
                              <td> ${browserWebSigninIssues} </td>
                              <td> ${browserJoinMeetingIssues} </td>
                              <td> </td>
                              <td> ${installedSoftwareIssues} </td>
                              <td> ${installedSoftwareMeetingIssues} </td>
                              <td> </td>
                              <td> </td>
                              <td> ${windowsIssues} </td>
                              <td> ${macIssues} </td>
                              <td> </td>
                              <td> ${androidIssues} </td>
                            </tr>
                            <tr> 
                              <td> Week 2 </td> 
                              <td> 0 </td>
                              <td> 0 </td>
                              <td> 0 </td>
                              <td> 0 </td>
                              <td> </td>
                              <td> 0 </td>
                              <td> 0 </td>
                              <td> </td>
                              <td> </td>
                              <td> 0 </td>
                              <td> 0 </td>
                              <td> </td>
                              <td> 0 </td>
                            </tr>
                            <tr> 
                              <td> Week 3 </td> 
                              <td> 0 </td>
                              <td> 0 </td>
                              <td> 0 </td>
                              <td> 0 </td>
                              <td> </td>
                              <td> 0 </td>
                              <td> 0 </td>
                              <td> </td>
                              <td> </td>
                              <td> 0 </td>
                              <td> 0 </td>
                              <td> </td>
                              <td> 0 </td>
                            </tr>
                    </table>
                </div>
                </body>
            </html>
            `
        const options = { format: 'A4', path: './weeklysummary.pdf' }
        html_to_pdf.generatePdf({content: html}, options).then(output => {
            const data = fs.readFileSync('./weeklysummary.pdf')
            const filename = 'weeklysummary.pdf'
                mg.messages.create('tools.vt.team', {
                from: "reports@vt.team",
                to: ["jonathankolman@gmail.com", "Chris.marr@vt.team"],
                subject: "CVS Dashboard",
                html,
                attachment: {data, filename, contentType: 'application/pdf'}
            })
            .then(msg => console.log(msg)) // logs response data
            .catch(err => console.log(err)); // logs any error
            })
            
        })
        //pdf.create(html, options).toFile('./weeklysummary.pdf', (err, res) => {

        




