import { expect } from 'chai'
import agent from 'superagent-bluebird-promise'
import mongoose from 'mongoose'
import models from './models'


describe('tests', () => {
	it('should make an superagent request', done => {
		agent.get('https://google.com')
		.then(res => {
			expect(res).to.be.ok
			done()
		})
	})
	it('should load environment variables from .env file', done => {
		require('dotenv').load()
		expect(process.env.DATABASE_URL).to.not.be.undefined
		expect(process.env.DATABASE_URL).to.eq('mongodb://localhost/node-starter-project')
		done()
	})
	it('should initialize bullshit database', done => {
		mongoose.connect(process.env.DATABASE_URL).then(connection => {
			expect(connection).to.not.be.undefined
			done()
		})
	})
	it('should remove bullshit from mongodb', done => {
		mongoose.model('bullshit').remove().then(res => {
			expect(res).to.not.be.undefined
			done()
		})
	})
	it('should write some bullshit in mongodb', done => {
		let bullshit = {
			name:'jon kolman',
			profession:'full stack developer',
			age: '23'
		}
		mongoose.model('bullshit').create(bullshit).then(doc => {
			expect(doc).to.not.be.undefined
			doc.save()
			done()
		})
	})
	it('should get bullshit', done => {
		mongoose.model('bullshit').find().count()
		.then(count => {
			console.log('found', count)
			expect(count).to.eq(1)
			done()
		})
	})
})