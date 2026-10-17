import test from 'node:test';
import assert from 'node:assert/strict';
import {findGIF} from './giphy-api.mjs';
test('GIF search encodes a tag and extracts its image and title',async()=>{
  let request;
  const result = await findGIF('happy cats','example-key',async url=>{
    request=new URL(url); return {ok:true,json:async()=>({data:{title:'Cat',images:{original:{url:'https://media.giphy.com/example.gif'}}}})};
  });
  assert.equal(request.searchParams.get('tag'),'happy cats'); assert.equal(request.searchParams.get('rating'),'g');
  assert.deepEqual(result,{url:'https://media.giphy.com/example.gif',title:'Cat'});
});
test('GIF search rejects missing keys, empty results and non-success HTTP responses',async()=>{
  await assert.rejects(findGIF('cats',''),/API key/);
  await assert.rejects(findGIF('cats','example-key',async()=>({ok:false,status:403})),/HTTP 403/);
  await assert.rejects(findGIF('cats','example-key',async()=>({ok:true,json:async()=>({data:{}})})),/No GIF/);
});
