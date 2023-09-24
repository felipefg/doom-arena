local cartesi_rolling_machine = require("cartesi-testlib.rolling-machine")
local encode_utils = require("cartesi-testlib.encode-utils")
local lester = require("luadeps.lester")
local fromhex, tohex = encode_utils.fromhex, encode_utils.tohex
local bint256 = require 'luadeps.bint'(256)
local tobe = bint256.tobe
local describe, it, expect = lester.describe, lester.it, lester.expect
local null = require'cjson'.null
local json_encode = require 'cjson'.encode
local json_decode = require 'cjson'.decode

------------------------------------------
-- Configurations

local config = {
  PORTAL_ERC20_ADDRESS = fromhex'0x9C21AEb2093C32DDbC53eEF24B873BDCd1aDa1DB',
  TOKEN_ERC20_ADDRESS = fromhex'0xc6e7DF5E7b4f2A278906862b61205850344D4e7d',
}

local ALICE_WALLET = fromhex'0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
local BOB_WALLET = fromhex'0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92267'
local CARLO_WALLET = fromhex'0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92268'
local HOST_WALLET = fromhex'0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92261'

local machine_config = "../.sunodo/image"
-- local machine_config = dofile('./.sunodo/image.config.lua')
local machine_runtime_config = {skip_root_hash_check = true}
local machine_remote_protocol = "jsonrpc"

----------------------------------------
-- Utilities

local function tohexbe(x)
    return tohex(tobe(x))
end

local expected_ok_res = {
    status = "accepted",
    vouchers = {},
    notices = {},
    reports = {}
}

local function read_file(file)
    return io.open(file, 'rb'):read("a")
end

local function decode_response_jsons(res)
    for i,v in ipairs(res.reports) do
        res.reports[i] = json_decode(v.payload)
    end
    return res
end

local timestamp = 0
local function deposit_advance(machine, sender, amount, data)
    timestamp = timestamp + 1
    return decode_response_jsons(machine:advance_state({
        metadata = {msg_sender = config.PORTAL_ERC20_ADDRESS, timestamp=timestamp},
        payload = encode_utils.encode_erc20_deposit{
            contract_address = config.TOKEN_ERC20_ADDRESS,
            sender_address = sender,
            amount = amount,
            extra_data = json_encode(data)
        },
    }, true))
end

local function advance(machine, sender, data)
    return decode_response_jsons(machine:advance_state({
        metadata = {msg_sender = sender},
        payload = json_encode(data)
    }, true))
end

local function inspect(machine, path)
    return decode_response_jsons(machine:inspect_state({payload = path}))
end

local function raw_inspect(machine, path)
    return machine:inspect_state({payload = path})
end
--------------
-- Tests

local e18 = bint256.ipow(10, 18)

describe("tests", function()
    local machine <close> = cartesi_rolling_machine(machine_config, machine_runtime_config, machine_remote_protocol)
    machine:run_until_yield_or_halt()

    it("should create a contest", function()
        local res = deposit_advance(machine, HOST_WALLET, tobe(100 * e18), {
            action="create_contest",
            name="Contest",
            ticket_price=tohexbe(10 * e18),
            difficulty=3,
            level=1,
            play_time = 3600,
            submission_time = 4800,
        })
        expect.equal(res, expected_ok_res)
    end)

--[[
    it("should accept contest creation while a contest is going on", function()
        local res = deposit_advance(machine, HOST_WALLET, 100, {
            action="create_contest",
            name="Contest",
            ticket_price=tohexbe(10))
            difficulty=2,
            level=3,
            play_time = 1200,
            submission_time = 2400,
        })
        expect.equal(res.status, "accepted")
    end)
]]
    it("should get active contest", function()
        local res = inspect(machine, "active_contest")
        expect.equal(res.status, "accepted")
        expect.equal(res.reports[1], {
            contest_id=1,
            host=tohex(HOST_WALLET),
            name="Contest",
            ticket_price=tohexbe(10 * e18),
            difficulty=3,
            level=1,
            play_time = 3600,
            submission_time = 4800,
            creation_timestamp=1,
            state="ready_to_play",
            prize_pool=tohexbe(100 * e18),
            players={},
            host_reward=tohexbe(0),
        })
    end)

    it("alice should not join a contest without paying ticket price", function()
        local res = deposit_advance(machine, ALICE_WALLET, tobe(9 * e18), {
            action="join_contest",
            contest_id=1,
            gameplay_hash="0539eb40ecaa599f4cec6e2b398b3ed3552990f0387b295c64d0f10da9c3bfbb",
        })
        expect.equal(res.status, "rejected")
    end)

    it("alice should join a contest", function()
        local res = deposit_advance(machine, ALICE_WALLET, tobe(10 * e18), {
            action="join_contest",
            contest_id=1,
            gameplay_hash="0539eb40ecaa599f4cec6e2b398b3ed3552990f0387b295c64d0f10da9c3bfbb",
        })
        expect.equal(res, expected_ok_res)
    end)

    it("bob should join a contest", function()
        local res = deposit_advance(machine, BOB_WALLET, tobe(10 * e18), {
            action="join_contest",
            contest_id=1,
            gameplay_hash="b646dc09a63ca6dc78c72a7dd67b2e0f99fb05eb7f32e4b4f955f2e4bd08e33a"
        })
        expect.equal(res, expected_ok_res)
    end)

    it("bob cannot submit a gameplay before the submission time", function()
        local res = advance(machine, BOB_WALLET, {
            action="submit_contest",
            contest_id=1,
            gameplay=tohex(read_file("bob.rivlog")),
        })
        expect.equal(res.status, "rejected")
    end)

    it("bob should not join a contest twice", function()
        local res = deposit_advance(machine, BOB_WALLET, tobe(9 * e18), {
            action="join_contest",
            contest_id=1,
            gameplay_hash="b646dc09a63ca6dc78c72a7dd67b2e0f99fb05eb7f32e4b4f955f2e4bd08e33a"
        })
        expect.equal(res.status, "rejected")
    end)

    it("should get active contest", function()
        local res = inspect(machine, "active_contest")
        expect.equal(res.status, "accepted")
        expect.equal(res.reports[1], {
            contest_id=1,
            host=tohex(HOST_WALLET),
            name="Contest",
            ticket_price=tohexbe(10 * e18),
            difficulty=3,
            level=1,
            play_time = 3600,
            submission_time = 4800,
            creation_timestamp=1,
            state="ready_to_play",
            prize_pool=tohexbe(118 * e18),
            players={
                {wallet = tohex(ALICE_WALLET), score=null, reward=null},
                {wallet = tohex(BOB_WALLET), score=null, reward=null},
            },
            host_reward=tohexbe(2 * e18),
        })
    end)

    it("carlo should join a contest paying more than tickt price", function()
        local res = deposit_advance(machine, CARLO_WALLET, tobe(20 * e18), {
            action="join_contest",
            contest_id=1,
            gameplay_hash="b646dc09a63ca6dc78c72a7dd67b2e0f99fb05eb7f32e4b4f955f2e4bd08e33a"
        })
        expect.equal(res, expected_ok_res)
    end)

    it("should get active contest", function()
        local res = inspect(machine, "active_contest")
        expect.equal(res.status, "accepted")
        expect.equal(res.reports[1], {
            contest_id=1,
            host=tohex(HOST_WALLET),
            name="Contest",
            ticket_price=tohexbe(10 * e18),
            difficulty=3,
            level=1,
            play_time = 3600,
            submission_time = 4800,
            creation_timestamp=1,
            state="ready_to_play",
            prize_pool=tohexbe(136 * e18),
            players={
                {wallet = tohex(ALICE_WALLET), score=null, reward=null},
                {wallet = tohex(BOB_WALLET), score=null, reward=null},
                {wallet = tohex(CARLO_WALLET), score=null, reward=null},
            },
            host_reward=tohexbe(4 * e18),
        })
    end)

    it("should end contest play phase", function()
        local res = advance(machine, ALICE_WALLET, {
            action="end_contest",
            contest_id=1
        })
        expect.equal(res, expected_ok_res)
    end)

    it("alice should submit a gameplay", function()
        local res = advance(machine, ALICE_WALLET, {
            action="submit_contest",
            contest_id=1,
            gameplay=tohex(read_file("alice.rivlog")),
        })
        expect.equal(res, expected_ok_res)
    end)

    it("bob should submit a gameplay", function()
        local res = advance(machine, BOB_WALLET, {
            action="submit_contest",
            contest_id=1,
            gameplay=tohex(read_file("bob.rivlog")),
        })
        expect.equal(res, expected_ok_res)
    end)

    it("should get active contest scores", function()
        local res = inspect(machine, "active_contest")
        expect.equal(res.status, "accepted")
        expect.equal(res.reports[1], {
            contest_id=1,
            host=tohex(HOST_WALLET),
            name="Contest",
            ticket_price=tohexbe(10 * e18),
            difficulty=3,
            level=1,
            play_time = 3600,
            submission_time = 4800,
            creation_timestamp=1,
            state="gameplay_submission",
            prize_pool=tohexbe(136 * e18),
            players={
                {wallet = tohex(ALICE_WALLET), score=-12, reward=null},
                {wallet = tohex(BOB_WALLET), score=-5, reward=null},
                {wallet = tohex(CARLO_WALLET), score=null, reward=null},
            },
            host_reward=tohexbe(4 * e18),
        })
    end)

    it("should finalize contest", function()
        local res = advance(machine, ALICE_WALLET, {
            action="finalize_contest",
            contest_id=1
        })
        expect.equal(res, expected_ok_res)
    end)

    it("should get active contest", function()
        local res = inspect(machine, "active_contest")
        expect.equal(res.status, "accepted")
        expect.equal(res.reports[1], {
            contest_id=1,
            host=tohex(HOST_WALLET),
            name="Contest",
            ticket_price=tohexbe(10 * e18),
            difficulty=3,
            level=1,
            play_time = 3600,
            submission_time = 4800,
            creation_timestamp=1,
            state="finalized",
            prize_pool=tohexbe(136 * e18),
            players={
                {wallet = tohex(ALICE_WALLET), score=-12, reward=tohexbe('45300000000000000000')},
                {wallet = tohex(BOB_WALLET), score=-5, reward=tohexbe('90700000000000000000')},
                {wallet = tohex(CARLO_WALLET), score=null, reward=null},
            },
            host_reward=tohexbe(4 * e18),
        })
    end)

    it("should get first contest", function()
        local res = inspect(machine, "contest/1")
        expect.equal(res.status, "accepted")
        expect.equal(res.reports[1], {
            contest_id=1,
            host=tohex(HOST_WALLET),
            name="Contest",
            ticket_price=tohexbe(10 * e18),
            difficulty=3,
            level=1,
            play_time = 3600,
            submission_time = 4800,
            creation_timestamp=1,
            state="finalized",
            prize_pool=tohexbe(136 * e18),
            players={
                {wallet = tohex(ALICE_WALLET), score=-12, reward=tohexbe('45300000000000000000')},
                {wallet = tohex(BOB_WALLET), score=-5, reward=tohexbe('90700000000000000000')},
                {wallet = tohex(CARLO_WALLET), score=null, reward=null},
            },
            host_reward=tohexbe(4 * e18),
        })
    end)

    it("should retrieve gameplay file", function()
        local res = raw_inspect(machine, "gameplay/1/" .. tohex(ALICE_WALLET))
        expect.equal(res.status, "accepted")
        expect.equal(res.reports[1].payload, read_file("alice.rivlog"))
    end)
end)
