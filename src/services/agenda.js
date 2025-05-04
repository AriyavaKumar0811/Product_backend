const Agenda = require('agenda');
const { Web3 } = require('web3');
const { Transaction } = require('../models');
const { decrypt } = require('./common');
const ENV = require('../config');

const agenda = new Agenda({
    db: { address: decrypt(ENV.MONGO_URI), collection: 'AGENDA_JOBS' }
});

// ✅ Setup Web3 for tracking deposits
const web3 = new Web3(ENV.INFURA_URL);
// const adminAddress = ENV.ADMIN_WALLET_ADDRESS.toLowerCase();

// ✅ Job list (added `track-deposits`)
let JOBS = [
    { jobName: 'track-deposits', interval: '15 minutes', data: {} }
];

// ✅ Start agenda and recreate jobs that don’t exist
(async () => {
    if (process.env.NODE_ENV !== 'local') return;

    await agenda.start();
    let jobs = await agenda.jobs();
    let activeJobs = jobs.map(job => job.attrs.name);

    for (let { jobName, interval, data } of JOBS) {
        if (!activeJobs.includes(jobName)) {
            await agenda.cancel({ name: jobName });
            await agenda.every(interval, jobName, data);
        }
    }
})();

// ✅ Deposit Tracking Job
agenda.define('track-deposits', async (job) => {
    try {
        console.log('🧭 Running job: track-deposits');

        const latestBlock = await web3.eth.getBlockNumber();
        const fromBlock = latestBlock - 100;

        for (let block = fromBlock; block <= latestBlock; block++) {
            const blockData = await web3.eth.getBlock(block, true);
            if (!blockData || !blockData.transactions) continue;

            for (const tx of blockData.transactions) {
                if (tx.to && tx.to.toLowerCase() === adminAddress) {
                    const exists = await Transaction.findOne({ hash: tx.hash });
                    if (!exists) {
                        await Transaction.create({
                            hash: tx.hash,
                            amount: web3.utils.fromWei(tx.value, 'ether'),
                            type: 'deposit',
                            symbol: 'tx.symbol',
                            userAddress: tx.from
                        });
                        console.log(`✅ New deposit saved: ${tx.hash}`);
                    }
                }
            }
        }
    } catch (err) {
        console.error('❌ Error in track-deposits:', err.message);
    }
});

// ✅ Existing: Track user active status
agenda.define('track-user-active-status', { priority: 'highest', concurrency: 10 }, async (job) => {
    const { to } = job.attrs.data;

    let resp = await user_model.findOne({ address: to }, 'trackStatus trackStatusCount isLoggedIn');

    if (resp) {
        if (resp.trackStatus && resp.trackStatusCount >= 5) {
            await user_model.updateOne({ address: to }, { $set: { trackStatus: false, trackStatusCount: 0, isLoggedIn: false } });
            await agenda.cancel({ _id: job.attrs._id });
        } else if (resp.trackStatus) {
            await user_model.updateOne({ address: to }, { $inc: { trackStatusCount: 1 } });
        } else {
            await user_model.updateOne({ address: to }, { $set: { trackStatus: true } });
        }

        job.attrs.nextRunAt = new Date(Date.now() + 60000);
        job.save();

        emitMessage('check-activity', { status: resp.isLoggedIn, data: to });
    }
});

// ✅ Exportable functions
const scheduleTrackUserAgenda = async (address, interval = '1 minute') => {
    await agenda.schedule(interval, 'track-user-active-status', { to: address });
};

const cancelTrackUserAgenda = async (address) => {
    await agenda.cancel({ name: 'track-user-active-status', 'data.to': address });
};

exports.scheduleTrackUserAgenda = scheduleTrackUserAgenda;
exports.cancelTrackUserAgenda = cancelTrackUserAgenda;
