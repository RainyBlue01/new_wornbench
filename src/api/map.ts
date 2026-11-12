import request from '@/utils/request'

export interface MapGeocoderParams {
  tk: string
  type?: string
  ds?: string
  postStr?: string
}

export function getMap(params: MapGeocoderParams) {
  return request.get('/business/v1/map/geocoder', { params })
}
