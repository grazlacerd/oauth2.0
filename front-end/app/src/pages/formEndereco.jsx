import { buscarCep } from '../service/viacep.js'

function FormEndereco({ endereco, setEndereco }) {
  async function handleCepChange(e) {
    const valorInput = e.target.value
    const cepDigitos = valorInput.replace(/\D/g, '')

    setEndereco((prev) => ({ ...prev, cep: valorInput }))

    if (cepDigitos.length === 8) {
      try {
        const dadosCep = await buscarCep(cepDigitos)
        setEndereco((prev) => ({
          ...prev,
          cep: dadosCep.cep,
          logradouro: dadosCep.logradouro,
          bairro: dadosCep.bairro,
          cidade: dadosCep.cidade,
          uf: dadosCep.uf
        }))
      } catch (erro) {
        console.error(erro.message)
      }
    }
  }

  function handleChange(campo, valor) {
    setEndereco((prev) => ({ ...prev, [campo]: valor }))
  }

  return (
    <fieldset className="form-endereco">
      <legend>Endereço</legend>

      <label>CEP
        <input 
          type="text" 
          value={endereco.cep} 
          onChange={handleCepChange} 
          maxLength={9} 
          required 
        />
      </label>

      <label>Logradouro
        <input 
          type="text" 
          value={endereco.logradouro} 
          onChange={(e) => handleChange('logradouro', e.target.value)} 
          required 
        />
      </label>

      <label>Número
        <input 
          type="text" 
          value={endereco.numero} 
          onChange={(e) => handleChange('numero', e.target.value)} 
          required 
        />
      </label>

      <label>Complemento
        <input 
          type="text" 
          value={endereco.complemento} 
          onChange={(e) => handleChange('complemento', e.target.value)} 
        />
      </label>

      <label>Bairro
        <input 
          type="text" 
          value={endereco.bairro} 
          onChange={(e) => handleChange('bairro', e.target.value)} 
          required 
        />
      </label>

      <label>Cidade
        <input 
          type="text" 
          value={endereco.cidade} 
          onChange={(e) => handleChange('cidade', e.target.value)} 
          required 
        />
      </label>

      <label>UF
        <input 
          type="text" 
          value={endereco.uf} 
          onChange={(e) => handleChange('uf', e.target.value)} 
          maxLength={2} 
          required 
        />
      </label>
    </fieldset>
  )
}

export default FormEndereco