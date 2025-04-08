// 前端工具函式：解析門市地址 + 組裝 userAddress 格式
import { taiwanAddress } from './taiwanAddress'

export function parseStoreAddress(storeName, storeAddr) {
    const cityMatch = storeAddr.match(/^(.{2,3}[市縣])/)
    const city = cityMatch ? cityMatch[1] : ''

    const districtMatch = storeAddr.match(/^[^市縣]+[市縣](.{1,3}[區鎮市鄉])/)
    const district = districtMatch ? districtMatch[1] : ''

    const rawStreet = storeAddr.replace(city + district, '')
    const streetEtc = `${city}${district}${rawStreet} - ${storeName}`

    const zipCode =
        taiwanAddress[city] && taiwanAddress[city][district]
            ? taiwanAddress[city][district]
            : ''

    return {
        city,
        district,
        zipCode,
        streetEtc,
    }
}

