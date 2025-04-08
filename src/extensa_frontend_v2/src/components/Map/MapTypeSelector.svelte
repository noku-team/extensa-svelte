<script lang="ts">
  import { MapType } from '../../types/map';
  import { mapStore } from '../../store/mapStore';

  const mapTypes = [
    { value: MapType.OSM, label: 'OpenStreetMap' },
    { value: MapType.GOOGLE, label: 'Google Maps' },
    { value: MapType.SWISS, label: 'Swiss Topo' },
    { value: MapType.BING, label: 'Bing Maps' }
  ];

  function handleMapTypeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    mapStore.update(state => ({
      ...state,
      mapType: select.value as MapType
    }));
  }
</script>

<div class="map-type-selector">
  <select on:change={handleMapTypeChange} value={$mapStore.mapType}>
    {#each mapTypes as { value, label }}
      <option value={value}>{label}</option>
    {/each}
  </select>
</div>

<style>
  .map-type-selector {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1000;
    background: white;
    padding: 5px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  select {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  }
</style> 