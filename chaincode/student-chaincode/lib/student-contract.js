/*
 * Student smart contract
 *
 * Student CRUD operation
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const docTypes  = require('./doc-types');

class StudentContract extends Contract {

    // InitLedger adds a base set of students to the ledger
    async InitLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const students = [
            {
                ID: 'SD101',
                FirstName: 'Navpreet',
                LastName: 'Singh',
                Email: 'navpreet.singh@debutinfotech.com',
                MobileNo: 9855043760,
                Address: 'Amritsar, Punjab',
                City: 'Amritsar'
            },           
        ];

        for (const student of students) {
            student.DocType = docTypes.student;
            await ctx.stub.putState(student.ID, Buffer.from(JSON.stringify(student)));

            console.info(`Student ${student.ID} initialized`);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    // AddNewStudent: Adds a new student to the world state with given details.
    async AddNewStudent(ctx, id, firstName, lastName, email, mobile_no, address, city) {
        console.info('============= START : AddNewStudent ===========');
        
        const exists = await this.StudentExists(ctx, id);
        if (exists) {
            throw new Error(`The student ${id} already exists`);
        }

        const student = {
            ID: id,
            DocType: docTypes.student,
            FirstName: firstName,
            LastName: lastName,
            Email: email,
            MobileNo: mobile_no,
            Address: address,
            City: city,
        };
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(student)));
        return JSON.stringify(student);
    }

    // get single student
    async GetSingleStudent(ctx, id) {
        console.info('============= START : GetSingleStudent ===========');

        const studentJSON = await ctx.stub.getState(id);
        if (!studentJSON || studentJSON.length === 0) {
            throw new Error(`The student ${id} does not exist`);
        }
        return studentJSON.toString();
    }

    // EditStudent 
    async EditStudent(ctx, id, firstName, lastName, email, mobile_no, address, city) {
        console.info('============= START : EditStudent ===========');
        
        const exists = await this.StudentExists(ctx, id);
        if (!exists) {
            throw new Error(`The student ${id} does not exist`);
        }

        // overwriting original student details with new student Information
        const updatedStudent = {
            ID: id,
            FirstName: firstName,
            LastName: lastName,
            Email: email,
            MobileNo: mobile_no,
            Address: address,
            City: city,
        };
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedStudent)));
    }

    // StudentExists returns true when Student with given ID exists in blockchain network.
    async StudentExists(ctx, id) {
        console.info('============= START : StudentExist for checking the existence of a Student ===========');

        const studentJSON = await ctx.stub.getState(id);
        return studentJSON && studentJSON.length > 0;
    }

    // GetAllStudent returns all students records found in the world state.
    async GetAllStudents(ctx) {
        console.info('============= START : GetAllStudent to return all the students ===========');

        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all students in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = StudentContract;
