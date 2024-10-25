<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div :class="{'modal-header error': isError, 'modal-header success': !isError}">
        <h3>{{ isError ? 'Error' : 'Message' }}</h3>
        <button class="close-button" @click="close">✕</button>
      </div>
      <div class="modal-body">
        <p>{{ message }}</p>
      </div>
      <div class="modal-footer">
        <button @click="close" class="modal-button">OK</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: true,
    },
    isError: {
      type: Boolean,
      default: false,
    },
    close: {
      type: Function,
      required: true,
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 300px;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
}

.modal-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.modal-header.error {
  background-color: #dc3545;
  color: #fff;
}

.modal-header.success {
  background-color: #28a745;
  color: #fff;
}

.modal-body {
  padding: 16px;
  font-size: 14px;
  color: #333;
}

.modal-footer {
  padding: 16px;
  display: flex;
  justify-content: center;
}

.modal-button {
  background-color: #4a399c;
  color: #fff;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-button:hover {
  background-color: #372a75;
}

.close-button {
  background: none;
  border: none;
  font-size: 18px;
  color: #fff;
  cursor: pointer;
}
</style>
