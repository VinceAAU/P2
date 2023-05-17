import test from 'ava';
import * as db from '../../master/db.js';

const {hash} = db.exportForTesting

test('Test hashing',async t=>{
    let password = 'sample password';
    t.assert(password != await hash(password));
});