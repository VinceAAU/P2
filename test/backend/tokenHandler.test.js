import test from 'ava';
import * as th from '../../master/tokenHandler.js';

const {decodeToken} = th.exportForTesting

test('Test decodeToken', t => {
    const expectedReturn = 'admin';
    const inputObject = {headers:{authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiYWRtaW4iLCJpYXQiOjE2ODQ1MDg2Njh9.IOs_CiG_JKpbMmUxrhBfgMGTtSH8Qf6DILdN7YFyBJI'}}
  t.deepEqual(decodeToken(inputObject), expectedReturn);
  });
