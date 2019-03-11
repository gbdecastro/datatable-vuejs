<?php
/***
 * Classe para manipulação do OCI versão alpha
 * 
 * Author Luiz Schmitt <lzschmitt@gmail.com>
 */

Class OCI {
    protected $oci = [];
    protected $sessions = [
        "ALTER SESSION SET NLS_TERRITORY='BRAZIL'",
        "ALTER SESSION SET NLS_LANGUAGE='BRAZILIAN PORTUGUESE'",
        "ALTER SESSION SET NLS_NUMERIC_CHARACTERS='.,'",
        "ALTER SESSION SET NLS_SORT='WEST_EUROPEAN_AI'",
        "ALTER SESSION SET NLS_COMP='BINARY'"
    ];

    public function __construct($username, $password, $database, $charset = 'utf8') {
        $this->oci['conn']  = oci_new_connect($username, $password, $database, $charset);

        if (!$this->oci['conn']) {
            $this->oci['error']['conn'] = oci_error();
        }
        
        if (is_array($this->sessions) && !empty($this->sessions)){
            foreach ($this->sessions as $session) {
                $this->oci['session'][] = $session;
                $this->oci['statement'] = oci_parse($this->oci['conn'], $session);
                oci_execute($this->oci['statement']);
            }
        }   
    }

    public function __destruct() 
    {
        oci_free_statement($this->oci['statement']);
        oci_close($this->oci['conn']);
    }

    public function getError() 
    {
        return $this->oci['error'];
    }

    public function query($sql) 
    {
        $sql = trim($sql);
        $this->oci['statement'] = oci_parse($this->oci['conn'], $sql);
        $this->execute();
        return $this;
    }

    public function execute($sql = null)
    {
        if (isset($sql)) {
            $this->oci['statement'] = oci_parse($this->oci['conn'], $sql);
        }

        return oci_execute($this->oci['statement']);
    }

    public function fetch() 
    {
        $rows = oci_fetch_all($this->oci['statement'], $response, 0, 1, OCI_FETCHSTATEMENT_BY_ROW + OCI_ASSOC);
        return $response[0];
    }

    public function fetchAll()
    {
        $rows = oci_fetch_all($this->oci['statement'], $response, 0, -1, OCI_FETCHSTATEMENT_BY_ROW + OCI_ASSOC);
        return $response;
    }
}