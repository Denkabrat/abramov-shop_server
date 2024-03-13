const cron = require('cron');
const https = require('https');

const backendUrl = 'https://abramov-shop-server.onrender.com/';

const job = new cron.CronJob('*/14 * * * *',function(){
        console.log('res server');

        https
            .get(backendUrl,(res)=> {
                if(res.statusCode === 200){
                    console.log('server restarted');
                }else{
                    console.log(res.statusCode);
                };
            })
            .on('error',(err) => {
                    console.log(err.message);
            })
});

module.exports = { job: job }



