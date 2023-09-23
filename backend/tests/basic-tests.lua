local cartesi_rolling_machine = require("cartesi-testlib.rolling-machine")
local encode_utils = require("cartesi-testlib.encode-utils")
local lester = require("luadeps.lester")
local fromhex, tohex = encode_utils.fromhex, encode_utils.tohex
local bint256 = require 'luadeps.bint'(256)
local describe, it, expect = lester.describe, lester.it, lester.expect
local json_encode = require 'luadeps.dkjson'.encode
local json_decode = require 'luadeps.dkjson'.decode

------------------------------------------
-- Configurations

local config = {
  PORTAL_ERC20_ADDRESS = fromhex'0x9C21AEb2093C32DDbC53eEF24B873BDCd1aDa1DB',
  TOKEN_ERC20_ADDRESS = fromhex'0xc6e7DF5E7b4f2A278906862b61205850344D4e7d',
}

local ALICE_WALLET = fromhex'0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
local BOB_WALLET = fromhex'0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92267'
local HOST_WALLET = fromhex'0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92261'

local machine_config = "../.sunodo/image"
-- local machine_config = dofile('./.sunodo/image.config.lua')
local machine_runtime_config = {skip_root_hash_check = true}
local machine_remote_protocol = "jsonrpc"

----------------------------------------
-- Utilities

local expected_ok_res = {
    status = "accepted",
    vouchers = {},
    notices = {},
    reports = {}
}

local function decode_response_jsons(res)
    for i,v in pairs(res.reports) do
        res.reports[i] = json_decode(v, res[i].payload)
    end
    return res
end

local function deposit_advance(machine, sender, amount, data)
    return decode_response_jsons(machine:advance_state({
        metadata = {msg_sender = config.PORTAL_ERC20_ADDRESS},
        payload = encode_utils.encode_erc20_deposit{
            contract_address = config.TOKEN_ERC20_ADDRESS,
            sender_address = sender,
            amount = bint256.tobe(amount),
            extra_data = json_encode(data)
        },
    }))
end

local function advance(machine, sender, data)
    return decode_response_jsons(machine:advance_state({
        metadata = {msg_sender = sender},
        payload = json_encode(data)
    }))
end

local function inspect(machine, path)
    return decode_response_jsons(machine:inspect_state({payload = path}))
end

--------------
-- Tests

describe("tests", function()
    local machine <close> = cartesi_rolling_machine(machine_config, machine_runtime_config, machine_remote_protocol)
    machine:run_until_yield_or_halt()

    it("should create a contest", function()
        local res = deposit_advance(machine, HOST_WALLET, 100, {
            action="create_contest",
            name="Contest",
            ticket_price=tohex(bint256.tobe(10)),
            difficulty=3,
            level=1,
            play_time = 3600,
            submission_time = 3600,
        })
        expect.equal(res, expected_ok_res)
    end)

--[[
    it("should reject contest creation while a contest is going on", function()
        local res = deposit_advance(machine, HOST_WALLET, 100, {
            action="create_contest",
            name="Contest",
            ticket_price=10,
            difficulty=3,
            level=1,
            play_time = 3600,
            submission_time = 3600,
        })
        expect.equal(res.status, "rejected")
    end)
]]

    it("should get active contest", function()
        local res = inspect(machine, "active_contest")
        expect.equal(res.status, "accepted")
        expect.equal(res.reports[1], {
            contest_id=1,
            players={},
            prize_pool=100,
        })
    end)

    it("alice should join a contest", function()
        local res = deposit_advance(machine, ALICE_WALLET, 10, {
            action="join_contest",
            contest_id=1,
            gameplay_hash="0x01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b"
        })
        expect.equal(res, expected_ok_res)
    end)

    it("bob should join a contest", function()
        local res = deposit_advance(machine, BOB_WALLET, 10, {
            action="join_contest",
            contest_id=1,
            gameplay_hash="0x01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b"
        })
        expect.equal(res, expected_ok_res)
    end)

    it("should end contest play phase", function()
        local res = advance(machine, ALICE_WALLET, {
            action="end_contest",
            contest_id=1
        })
        expect.equal(res, expected_ok_res)
    end)

    it("should submit a gameplay", function()
        local res = advance(machine, ALICE_WALLET, {
            action="submit_contest",
            contest_id=1,
            gameplay="0xff",
        })
        expect.equal(res, expected_ok_res)
    end)

    it("should finalize contest", function()
        local res = advance(machine, ALICE_WALLET, {
            action="finalize_contest",
            contest_id=1
        })
        expect.equal(res, expected_ok_res)
    end)
end)
