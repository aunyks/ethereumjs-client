const tape = require('tape')
const Block = require('ethereumjs-block')
const util = require('ethereumjs-util')
const { Chain, BlockPool } = require('../../lib/blockchain')
const { defaultLogger } = require('../../lib/logging')
defaultLogger.silent = true

tape('[BlockPool]', t => {
  t.test('should add block segment to chain', async (t) => {
    const chain = new Chain() // eslint-disable-line no-new
    const pool = new BlockPool({ chain })
    await pool.open()

    const block1 = new Block()
    block1.header.number = util.toBuffer(1)
    block1.header.difficulty = '0x11111111'
    block1.header.parentHash = chain.genesis.hash

    const block2 = new Block()
    block2.header.number = util.toBuffer(2)
    block2.header.difficulty = '0x22222222'
    block2.header.parentHash = block1.hash()

    // add blocks out of order to make sure they are inserted in order
    await pool.add(block2)
    await pool.add(block1)
    t.equal(chain.blocks.td.toString(16), '433333333', 'get chain.blocks.td')
    t.equal(chain.blocks.height.toString(10), '2', 'get chain.blocks.height')
    chain.close()
    t.end()
  })

  t.test('should get pool size', async (t) => {
    const chain = new Chain() // eslint-disable-line no-new
    const pool = new BlockPool({ chain })
    await pool.open()

    const block1 = new Block()
    block1.header.number = util.toBuffer(1)
    block1.header.difficulty = '0x11111111'
    block1.header.parentHash = chain.genesis.hash

    const block2 = new Block()
    block2.header.number = util.toBuffer(2)
    block2.header.difficulty = '0x22222222'
    block2.header.parentHash = block1.hash()

    await pool.add(block2)
    t.equal(pool.size, 1, 'pool contains out of order block')
    await pool.add(block1)
    t.equal(pool.size, 0, 'pool should be empty')
    chain.close()
    t.end()
  })

  t.test('should check opened state', async (t) => {
    const chain = new Chain() // eslint-disable-line no-new
    const pool = new BlockPool({ chain })
    t.equal(await pool.add([]), false, 'not opened')
    await pool.open()
    t.equal(await pool.open(), false, 'already opened')
    t.end()
  })
})
