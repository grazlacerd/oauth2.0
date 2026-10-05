export const buscarCep = async (cep) => {

  const cepLimpo = String(cep || '').replace(/\D/g, '')

  if (cepLimpo.length !== 8) {
    throw new Error("CEP não encontrado")
  }

  const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)

  if (!resposta.ok) {
    throw new Error("CEP não encontrado")
  }

  const dados = await resposta.json()


  if (dados.erro) {
    throw new Error("CEP não encontrado")
  }

  return {
    cep: dados.cep,
    logradouro: dados.logradouro,
    bairro: dados.bairro,
    cidade: dados.localidade, // Mapeia localidade para cidade
    uf: dados.uf
  }
}